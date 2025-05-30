const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get user's cart
router.get('/', protect, async (req, res, next) => {
    try {
        const [cartItems] = await pool.execute(`
            SELECT 
                ci.*,
                mi.name,
                mi.price,
                mi.image_url,
                mi.is_available,
                r.id as restaurant_id,
                r.name as restaurant_name
            FROM cart_items ci
            JOIN menu_items mi ON ci.menu_item_id = mi.id
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at DESC
        `, [req.user.id]);

        // Group items by restaurant
        const cart = cartItems.reduce((acc, item) => {
            if (!acc[item.restaurant_id]) {
                acc[item.restaurant_id] = {
                    restaurant_id: item.restaurant_id,
                    restaurant_name: item.restaurant_name,
                    items: []
                };
            }

            acc[item.restaurant_id].items.push({
                id: item.id,
                menu_item_id: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url,
                is_available: item.is_available,
                special_instructions: item.special_instructions,
                created_at: item.created_at
            });

            return acc;
        }, {});

        res.status(200).json({
            status: 'success',
            data: {
                cart: Object.values(cart)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Add item to cart
router.post('/items', protect, async (req, res, next) => {
    try {
        const { menu_item_id, quantity, special_instructions } = req.body;

        // Check if menu item exists and is available
        const [menuItem] = await pool.execute(`
            SELECT mi.*, r.id as restaurant_id 
            FROM menu_items mi
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE mi.id = ? AND mi.is_available = true
        `, [menu_item_id]);

        if (!menuItem[0]) {
            return next(new AppError('Menu item not found or unavailable', 404));
        }

        // Check if user already has items from a different restaurant
        const [existingItems] = await pool.execute(`
            SELECT DISTINCT r.id as restaurant_id
            FROM cart_items ci
            JOIN menu_items mi ON ci.menu_item_id = mi.id
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE ci.user_id = ? AND r.id != ?
        `, [req.user.id, menuItem[0].restaurant_id]);

        if (existingItems.length > 0) {
            return next(new AppError('You can only order from one restaurant at a time', 400));
        }

        // Check if item already exists in cart
        const [existingItem] = await pool.execute(
            'SELECT * FROM cart_items WHERE user_id = ? AND menu_item_id = ?',
            [req.user.id, menu_item_id]
        );

        if (existingItem.length > 0) {
            // Update quantity
            await pool.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existingItem[0].id]
            );
        } else {
            // Add new item
            await pool.execute(`
                INSERT INTO cart_items (
                    id, user_id, menu_item_id, quantity, special_instructions
                ) VALUES (?, ?, ?, ?, ?)
            `, [uuidv4(), req.user.id, menu_item_id, quantity, special_instructions]);
        }

        // Get updated cart
        const [cartItems] = await pool.execute(`
            SELECT 
                ci.*,
                mi.name,
                mi.price,
                mi.image_url,
                r.id as restaurant_id,
                r.name as restaurant_name
            FROM cart_items ci
            JOIN menu_items mi ON ci.menu_item_id = mi.id
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE ci.user_id = ?
        `, [req.user.id]);

        res.status(200).json({
            status: 'success',
            data: {
                cart_items: cartItems
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update cart item
router.patch('/items/:id', protect, async (req, res, next) => {
    try {
        const { quantity, special_instructions } = req.body;

        // Check if cart item exists and belongs to user
        const [cartItem] = await pool.execute(
            'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!cartItem[0]) {
            return next(new AppError('Cart item not found', 404));
        }

        // Update cart item
        await pool.execute(`
            UPDATE cart_items 
            SET quantity = ?, special_instructions = ?
            WHERE id = ?
        `, [quantity, special_instructions, req.params.id]);

        // Get updated cart item
        const [updatedItem] = await pool.execute(`
            SELECT 
                ci.*,
                mi.name,
                mi.price,
                mi.image_url,
                r.id as restaurant_id,
                r.name as restaurant_name
            FROM cart_items ci
            JOIN menu_items mi ON ci.menu_item_id = mi.id
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE ci.id = ?
        `, [req.params.id]);

        res.status(200).json({
            status: 'success',
            data: {
                cart_item: updatedItem[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

// Remove item from cart
router.delete('/items/:id', protect, async (req, res, next) => {
    try {
        // Check if cart item exists and belongs to user
        const [cartItem] = await pool.execute(
            'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!cartItem[0]) {
            return next(new AppError('Cart item not found', 404));
        }

        // Delete cart item
        await pool.execute(
            'DELETE FROM cart_items WHERE id = ?',
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

// Clear cart
router.delete('/', protect, async (req, res, next) => {
    try {
        await pool.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
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