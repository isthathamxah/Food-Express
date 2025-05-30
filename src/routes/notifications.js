const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get all notifications for a user
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [notifications] = await pool.execute(`
            SELECT * FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [req.user.id, parseInt(limit), offset]);

        // Get total count
        const [totalCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
            [req.user.id]
        );

        // Get unread count
        const [unreadCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount[0].count,
                    pages: Math.ceil(totalCount[0].count / limit)
                },
                unread_count: unreadCount[0].count
            }
        });
    } catch (error) {
        next(error);
    }
});

// Mark notification as read
router.patch('/:id/read', protect, async (req, res, next) => {
    try {
        // Check if notification exists and belongs to user
        const [notification] = await pool.execute(
            'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!notification[0]) {
            return next(new AppError('Notification not found', 404));
        }

        // Update notification
        await pool.execute(
            'UPDATE notifications SET is_read = true WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                message: 'Notification marked as read'
            }
        });
    } catch (error) {
        next(error);
    }
});

// Mark all notifications as read
router.patch('/read-all', protect, async (req, res, next) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = true WHERE user_id = ?',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                message: 'All notifications marked as read'
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete notification
router.delete('/:id', protect, async (req, res, next) => {
    try {
        // Check if notification exists and belongs to user
        const [notification] = await pool.execute(
            'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!notification[0]) {
            return next(new AppError('Notification not found', 404));
        }

        // Delete notification
        await pool.execute(
            'DELETE FROM notifications WHERE id = ?',
            [req.params.id]
        );

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

// Delete all notifications
router.delete('/', protect, async (req, res, next) => {
    try {
        await pool.execute(
            'DELETE FROM notifications WHERE user_id = ?',
            [req.user.id]
        );

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 