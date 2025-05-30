const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db.config');
const { AppError } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return next(new AppError('Email already in use', 400));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = uuidv4();
        await pool.execute(
            'INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, hashedPassword, phone]
        );

        // Generate token
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: userId,
                    name,
                    email,
                    phone
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Login user
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return next(new AppError('Invalid email or password', 401));
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError('Invalid email or password', 401));
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Remove password from output
        delete user.password;

        res.status(200).json({
            status: 'success',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
    try {
        const [user] = await pool.execute(
            'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
            [req.user.id]
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

// Update user profile
router.patch('/me', protect, async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;

        // Update user
        await pool.execute(
            'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
            [name, phone, address, req.user.id]
        );

        // Get updated user
        const [user] = await pool.execute(
            'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

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

// Change password
router.patch('/change-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [req.user.id]
        );

        const user = users[0];

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 