import { Router } from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all notifications
router.get('/', authenticate, getNotifications);

// POST explicitly to create a notification (e.g. from tests or webhooks)
router.post('/', authenticate, createNotification);

// PUT mark as read
router.put('/:id/read', authenticate, markAsRead);

export default router;
