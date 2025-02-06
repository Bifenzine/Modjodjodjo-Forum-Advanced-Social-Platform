import express from 'express';
import { authMiddleware } from '../Middleware/auth.middleware.js';
import { clearAllNotifications, deleteNotification, getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../Controllers/notification.controllers.js';

const router = express.Router();

// All routes ar

// Get all notifications for the logged-in user
router.get('/', authMiddleware, getNotifications);

// Mark a specific notification as read
router.patch('/:notificationId/read',authMiddleware, markNotificationAsRead);

// Clear all notifications for the logged-in user
router.delete('/clear-all', authMiddleware, clearAllNotifications);

// Delete a specific notification
router.delete('/:notificationId', authMiddleware, deleteNotification);


// Mark all notifications as read for the logged-in user
router.patch('/mark-all-read', authMiddleware, markAllNotificationsAsRead);

export default router;