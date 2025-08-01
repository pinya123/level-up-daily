import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { generateSuggestions } from '../utils/gamification';

const router = Router();

// Search users by username
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username parameter required' });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive'
        },
        id: {
          not: req.user!.id // Exclude current user
        }
      },
      select: {
        id: true,
        username: true,
        currentStreak: true,
        maxStreak: true
      },
      take: 10
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Send friend request
router.post('/friend-request', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId } = req.body;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: req.user!.id, receiverId },
          { senderId: receiverId, receiverId: req.user!.id }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship request already exists' });
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        senderId: req.user!.id,
        receiverId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Get friend requests
router.get('/friend-requests', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: req.user!.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            currentStreak: true,
            maxStreak: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Accept/reject friend request
router.put('/friend-request/:id', [
  body('status').isIn(['ACCEPTED', 'REJECTED']).withMessage('Valid status required')
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
    const { status } = req.body;

    // Check if request exists and belongs to user
    const friendship = await prisma.friendship.findFirst({
      where: {
        id,
        receiverId: req.user!.id,
        status: 'PENDING'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id },
      data: { status },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json({
      message: `Friend request ${status.toLowerCase()} successfully`,
      friendship: updatedFriendship
    });
  } catch (error) {
    console.error('Update friend request error:', error);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

// Get friends list
router.get('/friends', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id }
        ],
        status: 'ACCEPTED'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            currentStreak: true,
            maxStreak: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            currentStreak: true,
            maxStreak: true
          }
        }
      }
    });

    // Format friends list
    const friends = friendships.map(friendship => {
      const friend = friendship.senderId === req.user!.id ? friendship.receiver : friendship.sender;
      return {
        id: friend.id,
        username: friend.username,
        currentStreak: friend.currentStreak,
        maxStreak: friend.maxStreak
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Submit difficulty review
router.post('/difficulty-review', [
  body('taskId').notEmpty().withMessage('Task ID is required'),
  body('suggestedDifficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Valid difficulty required'),
  body('reason').optional()
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, suggestedDifficulty, reason } = req.body;

    // Check if task exists and belongs to a friend
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        completedAt: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is friends with task owner
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: task.user.id },
          { senderId: task.user.id, receiverId: req.user.id }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendship) {
      return res.status(403).json({ error: 'Can only review friends\' tasks' });
    }

    // Check if review already exists
    const existingReview = await prisma.difficultyReview.findFirst({
      where: {
        taskId,
        senderId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this task' });
    }

    // Create difficulty review
    const review = await prisma.difficultyReview.create({
      data: {
        taskId,
        senderId: req.user.id,
        receiverId: task.user.id,
        suggestedDifficulty,
        reason
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        },
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Difficulty review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Submit difficulty review error:', error);
    res.status(500).json({ error: 'Failed to submit difficulty review' });
  }
});

// Get difficulty reviews for user
router.get('/difficulty-reviews', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const reviews = await prisma.difficultyReview.findMany({
      where: {
        receiverId: req.user.id,
        status: 'PENDING'
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        },
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get difficulty reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch difficulty reviews' });
  }
});

// Accept/reject difficulty review
router.put('/difficulty-review/:id', [
  body('status').isIn(['ACCEPTED', 'REJECTED']).withMessage('Valid status required')
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
    const { status } = req.body;

    // Check if review exists and belongs to user
    const review = await prisma.difficultyReview.findFirst({
      where: {
        id,
        receiverId: req.user.id,
        status: 'PENDING'
      },
      include: {
        task: true
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Difficulty review not found' });
    }

    // Update review status
    const updatedReview = await prisma.difficultyReview.update({
      where: { id },
      data: { status },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        },
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // If accepted, update task difficulty and recalculate points
    if (status === 'ACCEPTED') {
      const basePoints = {
        EASY: 50,
        MEDIUM: 70,
        HARD: 100
      }[review.suggestedDifficulty];

      await prisma.task.update({
        where: { id: review.taskId },
        data: {
          difficulty: review.suggestedDifficulty,
          points: basePoints
        }
      });
    }

    res.json({
      message: `Difficulty review ${status.toLowerCase()} successfully`,
      review: updatedReview
    });
  } catch (error) {
    console.error('Update difficulty review error:', error);
    res.status(500).json({ error: 'Failed to update difficulty review' });
  }
});

// Get productivity suggestions
router.get('/suggestions', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const suggestions = await generateSuggestions(prisma, req.user.id);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router; 