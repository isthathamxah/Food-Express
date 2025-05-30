const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get all users (admin only)
router.get('/', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, role, created_at FROM users'
        );

        res.status(200).json({
            status: 'success',
            data: {
                users
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get user by ID (admin only)
router.get('/:id', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const [user] = await pool.execute(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user[0]) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update user role (admin only)
router.patch('/:id/role', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'restaurant_owner', 'admin'].includes(role)) {
            return next(new AppError('Invalid role', 400));
        }

        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, req.params.id]
        );

        const [user] = await pool.execute(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user[0]) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete user (admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('User not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 