import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Register push token
router.post('/register-token', [
  body('token').notEmpty().withMessage('Push token is required'),
  body('platform').isIn(['ios', 'android']).withMessage('Valid platform required')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, platform } = req.body;

    // Store push token (in a real app, you'd have a separate table for this)
    // For now, we'll just acknowledge the registration
    console.log(`Push token registered for user ${req.user.id}: ${token} (${platform})`);

    res.json({
      message: 'Push token registered successfully'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For MVP, we'll return a simple notification structure
    // In a real app, you'd have a notifications table
    const notifications = [
      {
        id: '1',
        type: 'streak',
        title: 'Streak Alert!',
        message: 'You\'re on a 3-day streak! Keep it going!',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'competition',
        title: 'New Competition',
        message: 'You\'ve been invited to join "Study Group Challenge"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: true
      }
    ];

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // In a real app, you'd update the notification in the database
    console.log(`Marking notification ${id} as read for user ${req.user.id}`);

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get reminder settings
router.get('/reminders', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For MVP, return default reminder settings
    const settings = {
      enabled: true,
      taskReminders: true,
      streakReminders: true,
      competitionUpdates: true,
      quietHours: {
        start: 22, // 10 PM
        end: 8     // 8 AM
      }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get reminder settings error:', error);
    res.status(500).json({ error: 'Failed to fetch reminder settings' });
  }
});

// Update reminder settings
router.put('/reminders', [
  body('enabled').optional().isBoolean(),
  body('taskReminders').optional().isBoolean(),
  body('streakReminders').optional().isBoolean(),
  body('competitionUpdates').optional().isBoolean(),
  body('quietHours.start').optional().isInt({ min: 0, max: 23 }),
  body('quietHours.end').optional().isInt({ min: 0, max: 23 })
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
      enabled,
      taskReminders,
      streakReminders,
      competitionUpdates,
      quietHours
    } = req.body;

    // In a real app, you'd update these settings in the database
    console.log(`Updating reminder settings for user ${req.user.id}:`, {
      enabled,
      taskReminders,
      streakReminders,
      competitionUpdates,
      quietHours
    });

    res.json({
      message: 'Reminder settings updated successfully'
    });
  } catch (error) {
    console.error('Update reminder settings error:', error);
    res.status(500).json({ error: 'Failed to update reminder settings' });
  }
});

export default router; 