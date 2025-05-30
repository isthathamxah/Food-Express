const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get all active promotions for a restaurant
router.get('/restaurant/:restaurantId', async (req, res, next) => {
    try {
        const [promotions] = await pool.execute(`
            SELECT * FROM promotions 
            WHERE restaurant_id = ? 
            AND is_active = true 
            AND start_date <= NOW() 
            AND end_date >= NOW()
            AND (usage_limit IS NULL OR usage_count < usage_limit)
            ORDER BY created_at DESC
        `, [req.params.restaurantId]);

        res.status(200).json({
            status: 'success',
            data: {
                promotions
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get all promotions for a restaurant (protected, restaurant owner only)
router.get('/restaurant/:restaurantId/all', protect, async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        const [restaurant] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ? AND owner_id = ?',
            [req.params.restaurantId, req.user.id]
        );

        if (!restaurant[0] && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to view these promotions', 403));
        }

        const [promotions] = await pool.execute(`
            SELECT * FROM promotions 
            WHERE restaurant_id = ?
            ORDER BY created_at DESC
        `, [req.params.restaurantId]);

        res.status(200).json({
            status: 'success',
            data: {
                promotions
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create promotion (protected, restaurant owner only)
router.post('/', protect, async (req, res, next) => {
    try {
        const {
            restaurant_id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            start_date,
            end_date,
            usage_limit
        } = req.body;

        // Check if user is restaurant owner
        const [restaurant] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ? AND owner_id = ?',
            [restaurant_id, req.user.id]
        );

        if (!restaurant[0] && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to create promotions for this restaurant', 403));
        }

        // Check if code already exists
        const [existingPromotion] = await pool.execute(
            'SELECT * FROM promotions WHERE code = ?',
            [code]
        );

        if (existingPromotion.length > 0) {
            return next(new AppError('Promotion code already exists', 400));
        }

        // Create promotion
        const promotionId = uuidv4();
        await pool.execute(`
            INSERT INTO promotions (
                id, restaurant_id, code, description, discount_type,
                discount_value, min_order_value, max_discount,
                start_date, end_date, usage_limit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            promotionId,
            restaurant_id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            start_date,
            end_date,
            usage_limit
        ]);

        const [promotion] = await pool.execute(
            'SELECT * FROM promotions WHERE id = ?',
            [promotionId]
        );

        res.status(201).json({
            status: 'success',
            data: {
                promotion: promotion[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update promotion (protected, restaurant owner only)
router.patch('/:id', protect, async (req, res, next) => {
    try {
        const {
            description,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            start_date,
            end_date,
            usage_limit,
            is_active
        } = req.body;

        // Check if promotion exists and user is restaurant owner
        const [promotion] = await pool.execute(`
            SELECT p.*, r.owner_id 
            FROM promotions p
            JOIN restaurants r ON p.restaurant_id = r.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (!promotion[0]) {
            return next(new AppError('Promotion not found', 404));
        }

        if (promotion[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to update this promotion', 403));
        }

        // Update promotion
        await pool.execute(`
            UPDATE promotions 
            SET 
                description = ?,
                discount_type = ?,
                discount_value = ?,
                min_order_value = ?,
                max_discount = ?,
                start_date = ?,
                end_date = ?,
                usage_limit = ?,
                is_active = ?
            WHERE id = ?
        `, [
            description,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            start_date,
            end_date,
            usage_limit,
            is_active,
            req.params.id
        ]);

        const [updatedPromotion] = await pool.execute(
            'SELECT * FROM promotions WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                promotion: updatedPromotion[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete promotion (protected, restaurant owner only)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        // Check if promotion exists and user is restaurant owner
        const [promotion] = await pool.execute(`
            SELECT p.*, r.owner_id 
            FROM promotions p
            JOIN restaurants r ON p.restaurant_id = r.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (!promotion[0]) {
            return next(new AppError('Promotion not found', 404));
        }

        if (promotion[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to delete this promotion', 403));
        }

        await pool.execute(
            'DELETE FROM promotions WHERE id = ?',
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

// Validate promotion code
router.post('/validate', protect, async (req, res, next) => {
    try {
        const { code, restaurant_id, order_amount } = req.body;

        const [promotion] = await pool.execute(`
            SELECT * FROM promotions 
            WHERE code = ? 
            AND restaurant_id = ?
            AND is_active = true 
            AND start_date <= NOW() 
            AND end_date >= NOW()
            AND (usage_limit IS NULL OR usage_count < usage_limit)
        `, [code, restaurant_id]);

        if (!promotion[0]) {
            return next(new AppError('Invalid or expired promotion code', 400));
        }

        const promo = promotion[0];

        // Check minimum order value
        if (promo.min_order_value && order_amount < promo.min_order_value) {
            return next(new AppError(`Minimum order amount of ${promo.min_order_value} required`, 400));
        }

        // Calculate discount
        let discount = 0;
        if (promo.discount_type === 'percentage') {
            discount = (order_amount * promo.discount_value) / 100;
            if (promo.max_discount && discount > promo.max_discount) {
                discount = promo.max_discount;
            }
        } else {
            discount = promo.discount_value;
        }

        res.status(200).json({
            status: 'success',
            data: {
                promotion: promo,
                discount
            }
        });
    } catch (error) {
        next(error);
    }
});

// Apply promotion (internal use only)
router.patch('/:id/apply', protect, async (req, res, next) => {
    try {
        // Check if promotion exists
        const [promotion] = await pool.execute(
            'SELECT * FROM promotions WHERE id = ?',
            [req.params.id]
        );

        if (!promotion[0]) {
            return next(new AppError('Promotion not found', 404));
        }

        // Update usage count
        await pool.execute(
            'UPDATE promotions SET usage_count = usage_count + 1 WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                message: 'Promotion applied successfully'
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 