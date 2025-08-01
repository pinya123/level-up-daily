import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { calculateLeaderboard } from '../utils/gamification';

const router = Router();

// Get all competitions for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const competitions = await prisma.competition.findMany({
      where: {
        OR: [
          { creatorId: req.user!.id },
          {
            members: {
              some: {
                userId: req.user!.id
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ competitions });
  } catch (error) {
    console.error('Get competitions error:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// Create new competition
router.post('/', [
  body('name').notEmpty().withMessage('Competition name is required'),
  body('description').optional(),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('memberIds').isArray().withMessage('Member IDs must be an array')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, memberIds = [] } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Validate member count (max 5 including creator)
    if (memberIds.length > 4) {
      return res.status(400).json({ error: 'Maximum 5 participants allowed' });
    }

    // Verify all member IDs exist
    const members = await prisma.user.findMany({
      where: {
        id: {
          in: memberIds
        }
      },
      select: { id: true, username: true }
    });

    if (members.length !== memberIds.length) {
      return res.status(400).json({ error: 'One or more member IDs are invalid' });
    }

    // Create competition with members
    const competition = await prisma.competition.create({
      data: {
        name,
        description,
        startDate: start,
        endDate: end,
        creatorId: req.user!.id,
        members: {
          create: [
            // Add creator as member
            {
              userId: req.user!.id
            },
            // Add other members
            ...members.map(member => ({
              userId: member.id
            }))
          ]
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Competition created successfully',
      competition
    });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(500).json({ error: 'Failed to create competition' });
  }
});

// Get competition details with leaderboard
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const competition = await prisma.competition.findFirst({
      where: {
        id,
        OR: [
          { creatorId: req.user!.id },
          {
            members: {
              some: {
                userId: req.user!.id
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        tasks: {
          where: {
            completedAt: { not: null }
          },
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: { completedAt: 'desc' }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Calculate leaderboard
    const leaderboard = await calculateLeaderboard(prisma, id);

    res.json({
      competition,
      leaderboard
    });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});

// Join competition
router.post('/:id/join', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Check if competition exists and is active
    const competition = await prisma.competition.findFirst({
      where: {
        id,
        isActive: true,
        endDate: { gt: new Date() }
      },
      include: {
        members: true
      }
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found or inactive' });
    }

    // Check if user is already a member
    const isMember = competition.members.some(member => member.userId === req.user!.id);
    if (isMember) {
      return res.status(400).json({ error: 'Already a member of this competition' });
    }

    // Check member limit
    if (competition.members.length >= 5) {
      return res.status(400).json({ error: 'Competition is full' });
    }

    // Add user to competition
    await prisma.competitionMember.create({
      data: {
        competitionId: id,
        userId: req.user!.id
      }
    });

    res.json({
      message: 'Successfully joined competition'
    });
  } catch (error) {
    console.error('Join competition error:', error);
    res.status(500).json({ error: 'Failed to join competition' });
  }
});

// Get competition leaderboard
router.get('/:id/leaderboard', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Check if user is part of this competition
    const membership = await prisma.competitionMember.findFirst({
      where: {
        competitionId: id,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this competition' });
    }

    const leaderboard = await calculateLeaderboard(prisma, id);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// End competition
router.post('/:id/end', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Check if user is the creator
    const competition = await prisma.competition.findFirst({
      where: {
        id,
        creatorId: req.user!.id
      }
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found or you are not the creator' });
    }

    // End the competition
    await prisma.competition.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    res.json({
      message: 'Competition ended successfully'
    });
  } catch (error) {
    console.error('End competition error:', error);
    res.status(500).json({ error: 'Failed to end competition' });
  }
});

export default router; 