const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [reviews] = await pool.execute(`
            SELECT 
                r.*,
                u.name as user_name,
                u.id as user_id
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `, [req.params.restaurantId, parseInt(limit), offset]);

        // Get total count
        const [totalCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM reviews WHERE restaurant_id = ?',
            [req.params.restaurantId]
        );

        res.status(200).json({
            status: 'success',
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount[0].count,
                    pages: Math.ceil(totalCount[0].count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get reviews by a user
router.get('/user/:userId', async (req, res, next) => {
    try {
        const [reviews] = await pool.execute(`
            SELECT 
                r.*,
                res.name as restaurant_name,
                res.image_url as restaurant_image
            FROM reviews r
            JOIN restaurants res ON r.restaurant_id = res.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.userId]);

        res.status(200).json({
            status: 'success',
            data: {
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create review (protected)
router.post('/', protect, async (req, res, next) => {
    try {
        const { restaurant_id, order_id, rating, comment } = req.body;

        // Check if order exists and belongs to user
        if (order_id) {
            const [order] = await pool.execute(
                'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = "delivered"',
                [order_id, req.user.id]
            );

            if (!order[0]) {
                return next(new AppError('You can only review orders that you have received', 400));
            }
        }

        // Check if user has already reviewed this restaurant
        const [existingReview] = await pool.execute(
            'SELECT * FROM reviews WHERE user_id = ? AND restaurant_id = ?',
            [req.user.id, restaurant_id]
        );

        if (existingReview.length > 0) {
            return next(new AppError('You have already reviewed this restaurant', 400));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Create review
            const reviewId = uuidv4();
            await connection.execute(`
                INSERT INTO reviews (
                    id, user_id, restaurant_id, order_id, rating, comment
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [reviewId, req.user.id, restaurant_id, order_id, rating, comment]);

            // Update restaurant rating
            const [ratings] = await connection.execute(`
                SELECT 
                    COUNT(*) as count,
                    AVG(rating) as average
                FROM reviews 
                WHERE restaurant_id = ?
            `, [restaurant_id]);

            await connection.execute(`
                UPDATE restaurants 
                SET rating = ?, rating_count = ?
                WHERE id = ?
            `, [
                ratings[0].average,
                ratings[0].count,
                restaurant_id
            ]);

            // Commit transaction
            await connection.commit();

            // Get created review
            const [review] = await pool.execute(`
                SELECT 
                    r.*,
                    u.name as user_name,
                    res.name as restaurant_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN restaurants res ON r.restaurant_id = res.id
                WHERE r.id = ?
            `, [reviewId]);

            res.status(201).json({
                status: 'success',
                data: {
                    review: review[0]
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        next(error);
    }
});

// Update review (protected)
router.patch('/:id', protect, async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        // Check if review exists and belongs to user
        const [review] = await pool.execute(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!review[0]) {
            return next(new AppError('Review not found', 404));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update review
            await connection.execute(`
                UPDATE reviews 
                SET rating = ?, comment = ?
                WHERE id = ?
            `, [rating, comment, req.params.id]);

            // Update restaurant rating
            const [ratings] = await connection.execute(`
                SELECT 
                    COUNT(*) as count,
                    AVG(rating) as average
                FROM reviews 
                WHERE restaurant_id = ?
            `, [review[0].restaurant_id]);

            await connection.execute(`
                UPDATE restaurants 
                SET rating = ?, rating_count = ?
                WHERE id = ?
            `, [
                ratings[0].average,
                ratings[0].count,
                review[0].restaurant_id
            ]);

            // Commit transaction
            await connection.commit();

            // Get updated review
            const [updatedReview] = await pool.execute(`
                SELECT 
                    r.*,
                    u.name as user_name,
                    res.name as restaurant_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN restaurants res ON r.restaurant_id = res.id
                WHERE r.id = ?
            `, [req.params.id]);

            res.status(200).json({
                status: 'success',
                data: {
                    review: updatedReview[0]
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        next(error);
    }
});

// Delete review (protected)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        // Check if review exists and belongs to user
        const [review] = await pool.execute(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!review[0]) {
            return next(new AppError('Review not found', 404));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete review
            await connection.execute(
                'DELETE FROM reviews WHERE id = ?',
                [req.params.id]
            );

            // Update restaurant rating
            const [ratings] = await connection.execute(`
                SELECT 
                    COUNT(*) as count,
                    AVG(rating) as average
                FROM reviews 
                WHERE restaurant_id = ?
            `, [review[0].restaurant_id]);

            await connection.execute(`
                UPDATE restaurants 
                SET rating = ?, rating_count = ?
                WHERE id = ?
            `, [
                ratings[0].average || 0,
                ratings[0].count,
                review[0].restaurant_id
            ]);

            // Commit transaction
            await connection.commit();

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router; 