import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error: any) {
        console.error('[Get Notifications Error]', error);
        res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
    }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { message, type, sender, missionId } = req.body;

        if (!message || !type || !sender) {
            return res.status(400).json({ error: 'message, type, and sender are required.' });
        }

        const notification = new Notification({
            message,
            type,
            sender,
            missionId
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error: any) {
        console.error('[Create Notification Error]', error);
        res.status(500).json({ error: 'Failed to create notification', details: error.message });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error: any) {
        console.error('[Mark Read Error]', error);
        res.status(500).json({ error: 'Failed to mark notification as read', details: error.message });
    }
};
