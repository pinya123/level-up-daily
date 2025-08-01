import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { calculatePoints, updateStreak } from '../utils/gamification';

const router = Router();

// Get all tasks for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status, competitionId } = req.query;

    const whereClause: any = {
      userId: req.user.id
    };

    if (status === 'pending') {
      whereClause.completedAt = null;
    } else if (status === 'completed') {
      whereClause.completedAt = { not: null };
    }

    if (competitionId) {
      whereClause.competitionId = competitionId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        competition: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('difficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Valid difficulty required'),
  body('description').optional(),
  body('isRecurring').optional().isBoolean(),
  body('recurrence').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY']),
  body('dueTime').optional().isISO8601(),
  body('competitionId').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      difficulty,
      isRecurring = false,
      recurrence,
      dueTime,
      competitionId
    } = req.body;

    // Calculate base points based on difficulty
    const difficultyPoints = {
      EASY: 50,
      MEDIUM: 70,
      HARD: 100
    };
    const basePoints = difficultyPoints[difficulty as keyof typeof difficultyPoints];

    const task = await prisma.task.create({
      data: {
        title,
        description,
        difficulty,
        points: basePoints,
        isRecurring,
        recurrence,
        dueTime: dueTime ? new Date(dueTime) : null,
        userId: req.user.id,
        competitionId
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD']),
  body('dueTime').optional().isISO8601()
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, difficulty, dueTime } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.id,
        completedAt: null // Can only edit pending tasks
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or already completed' });
    }

    // Recalculate points if difficulty changed
    let points = existingTask.points;
    if (difficulty && difficulty !== existingTask.difficulty) {
      const difficultyPoints = {
        EASY: 50,
        MEDIUM: 70,
        HARD: 100
      };
      points = difficultyPoints[difficulty as keyof typeof difficultyPoints];
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(difficulty && { difficulty }),
        ...(dueTime && { dueTime: new Date(dueTime) }),
        points
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Complete task
router.post('/:id/complete', [
  body('reflection').notEmpty().withMessage('Reflection is required')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reflection } = req.body;

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.id,
        completedAt: null
      },
      include: {
        user: {
          select: {
            dayStart: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or already completed' });
    }

    const now = new Date();
    const completedAt = now;

    // Calculate final points based on completion time
    const finalPoints = calculatePoints(task.points, task.user.dayStart, completedAt);

    // Update task and user streak in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          completedAt,
          reflection,
          points: finalPoints
        }
      });

      // Update user streak
      const updatedUser = await updateStreak(tx, req.user!.id, completedAt);

      return { updatedTask, updatedUser };
    });

    res.json({
      message: 'Task completed successfully',
      task: result.updatedTask,
      pointsEarned: finalPoints,
      user: result.updatedUser
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If task was completed, we need to adjust points and potentially streak
    if (task.completedAt) {
      await prisma.$transaction(async (tx) => {
        // Delete the task
        await tx.task.delete({ where: { id } });

        // Recalculate user streak without this task
        const user = await tx.user.findUnique({
          where: { id: req.user!.id },
          select: { currentStreak: true, maxStreak: true, lastTaskDate: true }
        });

        if (user) {
          // Find the most recent completed task
          const lastCompletedTask = await tx.task.findFirst({
            where: {
              userId: req.user!.id,
              completedAt: { not: null }
            },
            orderBy: { completedAt: 'desc' }
          });

          if (lastCompletedTask && lastCompletedTask.completedAt) {
            await updateStreak(tx, req.user!.id, lastCompletedTask.completedAt);
          } else {
            // No completed tasks left, reset streak
            await tx.user.update({
              where: { id: req.user!.id },
              data: {
                currentStreak: 0,
                lastTaskDate: null
              }
            });
          }
        }
      });
    } else {
      // Just delete the pending task
      await prisma.task.delete({ where: { id } });
    }

    res.json({
      message: 'Task deleted successfully',
      pointsLost: task.completedAt ? task.points : 0
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { period = '7' } = req.query;
    const days = parseInt(period as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.task.groupBy({
      by: ['completedAt'],
      where: {
        userId: req.user.id,
        completedAt: {
          gte: startDate,
          not: null
        }
      },
      _sum: {
        points: true
      }
    });

    const totalPoints = stats.reduce((sum, stat) => sum + (stat._sum.points || 0), 0);
    const tasksCompleted = stats.length;

    res.json({
      totalPoints,
      tasksCompleted,
      averagePointsPerTask: tasksCompleted > 0 ? totalPoints / tasksCompleted : 0,
      period: days
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 