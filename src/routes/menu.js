const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId', async (req, res, next) => {
    try {
        const [items] = await pool.execute(`
            SELECT 
                mi.*,
                mc.name as category_name
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.id
            WHERE mi.restaurant_id = ?
            ORDER BY mc.sort_order, mi.name
        `, [req.params.restaurantId]);

        res.status(200).json({
            status: 'success',
            data: {
                items
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get menu categories for a restaurant
router.get('/restaurant/:restaurantId/categories', async (req, res, next) => {
    try {
        const [categories] = await pool.execute(`
            SELECT * FROM menu_categories 
            WHERE restaurant_id = ?
            ORDER BY sort_order
        `, [req.params.restaurantId]);

        res.status(200).json({
            status: 'success',
            data: {
                categories
            }
        });
    } catch (error) {
        next(error);
    }
});

// Search menu items
router.get('/restaurant/:restaurantId/search', async (req, res, next) => {
    try {
        const { query } = req.query;

        const [items] = await pool.execute(`
            SELECT 
                mi.*,
                mc.name as category_name
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.id
            WHERE mi.restaurant_id = ?
            AND (mi.name LIKE ? OR mi.description LIKE ?)
            ORDER BY mc.sort_order, mi.name
        `, [req.params.restaurantId, `%${query}%`, `%${query}%`]);

        res.status(200).json({
            status: 'success',
            data: {
                items
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get menu item by ID
router.get('/:id', async (req, res, next) => {
    try {
        const [items] = await pool.execute(`
            SELECT 
                mi.*,
                mc.name as category_name
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.id
            WHERE mi.id = ?
        `, [req.params.id]);

        if (!items[0]) {
            return next(new AppError('Menu item not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                item: items[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create menu item (protected, restaurant owner only)
router.post('/', protect, async (req, res, next) => {
    try {
        const {
            restaurant_id,
            category_id,
            name,
            description,
            price,
            image_url,
            is_veg,
            is_spicy
        } = req.body;

        // Check if user is restaurant owner
        const [restaurant] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ? AND owner_id = ?',
            [restaurant_id, req.user.id]
        );

        if (!restaurant[0] && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to add items to this restaurant', 403));
        }

        const itemId = uuidv4();
        await pool.execute(`
            INSERT INTO menu_items (
                id, restaurant_id, category_id, name, description,
                price, image_url, is_veg, is_spicy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            itemId,
            restaurant_id,
            category_id,
            name,
            description,
            price,
            image_url,
            is_veg,
            is_spicy
        ]);

        const [item] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [itemId]
        );

        res.status(201).json({
            status: 'success',
            data: {
                item: item[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update menu item (protected, restaurant owner only)
router.put('/:id', protect, async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            image_url,
            is_veg,
            is_spicy,
            is_available,
            category_id
        } = req.body;

        // Check if user is restaurant owner
        const [item] = await pool.execute(`
            SELECT mi.*, r.owner_id 
            FROM menu_items mi
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE mi.id = ?
        `, [req.params.id]);

        if (!item[0]) {
            return next(new AppError('Menu item not found', 404));
        }

        if (item[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to update this item', 403));
        }

        await pool.execute(`
            UPDATE menu_items 
            SET 
                name = ?,
                description = ?,
                price = ?,
                image_url = ?,
                is_veg = ?,
                is_spicy = ?,
                is_available = ?,
                category_id = ?
            WHERE id = ?
        `, [
            name,
            description,
            price,
            image_url,
            is_veg,
            is_spicy,
            is_available,
            category_id,
            req.params.id
        ]);

        const [updatedItem] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                item: updatedItem[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete menu item (protected, restaurant owner only)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        const [item] = await pool.execute(`
            SELECT mi.*, r.owner_id 
            FROM menu_items mi
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE mi.id = ?
        `, [req.params.id]);

        if (!item[0]) {
            return next(new AppError('Menu item not found', 404));
        }

        if (item[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to delete this item', 403));
        }

        await pool.execute(
            'DELETE FROM menu_items WHERE id = ?',
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

module.exports = router; 