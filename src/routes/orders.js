const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get all orders for a user
router.get('/my-orders', protect, async (req, res, next) => {
    try {
        const [orders] = await pool.execute(`
            SELECT 
                o.*,
                r.name as restaurant_name,
                r.image_url as restaurant_image,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', oi.id,
                        'menu_item_id', oi.menu_item_id,
                        'name', mi.name,
                        'price', oi.price,
                        'quantity', oi.quantity,
                        'special_instructions', oi.special_instructions
                    )
                ) as items
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.status(200).json({
            status: 'success',
            data: {
                orders
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get all orders for a restaurant (protected, restaurant owner only)
router.get('/restaurant/:restaurantId', protect, async (req, res, next) => {
    try {
        // Check if user is restaurant owner
        const [restaurant] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ? AND owner_id = ?',
            [req.params.restaurantId, req.user.id]
        );

        if (!restaurant[0] && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to view these orders', 403));
        }

        const [orders] = await pool.execute(`
            SELECT 
                o.*,
                u.name as user_name,
                u.phone as user_phone,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', oi.id,
                        'menu_item_id', oi.menu_item_id,
                        'name', mi.name,
                        'price', oi.price,
                        'quantity', oi.quantity,
                        'special_instructions', oi.special_instructions
                    )
                ) as items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.restaurant_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.params.restaurantId]);

        res.status(200).json({
            status: 'success',
            data: {
                orders
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get order by ID
router.get('/:id', protect, async (req, res, next) => {
    try {
        const [orders] = await pool.execute(`
            SELECT 
                o.*,
                r.name as restaurant_name,
                r.image_url as restaurant_image,
                r.phone as restaurant_phone,
                u.name as user_name,
                u.phone as user_phone,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', oi.id,
                        'menu_item_id', oi.menu_item_id,
                        'name', mi.name,
                        'price', oi.price,
                        'quantity', oi.quantity,
                        'special_instructions', oi.special_instructions
                    )
                ) as items
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.id = ?
            GROUP BY o.id
        `, [req.params.id]);

        if (!orders[0]) {
            return next(new AppError('Order not found', 404));
        }

        // Check if user has permission to view this order
        const order = orders[0];
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            const [restaurant] = await pool.execute(
                'SELECT * FROM restaurants WHERE id = ? AND owner_id = ?',
                [order.restaurant_id, req.user.id]
            );

            if (!restaurant[0]) {
                return next(new AppError('You do not have permission to view this order', 403));
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create new order
router.post('/', protect, async (req, res, next) => {
    try {
        const {
            restaurant_id,
            items,
            delivery_address,
            delivery_phone,
            delivery_instructions,
            payment_method
        } = req.body;

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Calculate total amount and validate items
            let total_amount = 0;
            const orderItems = [];

            for (const item of items) {
                const [menuItem] = await connection.execute(
                    'SELECT * FROM menu_items WHERE id = ? AND is_available = true',
                    [item.menu_item_id]
                );

                if (!menuItem[0]) {
                    throw new AppError(`Menu item ${item.menu_item_id} not found or unavailable`, 400);
                }

                total_amount += menuItem[0].price * item.quantity;
                orderItems.push({
                    ...item,
                    price: menuItem[0].price
                });
            }

            // Create order
            const orderId = uuidv4();
            await connection.execute(`
                INSERT INTO orders (
                    id, user_id, restaurant_id, total_amount,
                    delivery_address, delivery_phone, delivery_instructions,
                    payment_method, status, payment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
            `, [
                orderId,
                req.user.id,
                restaurant_id,
                total_amount,
                delivery_address,
                delivery_phone,
                delivery_instructions,
                payment_method
            ]);

            // Create order items
            for (const item of orderItems) {
                await connection.execute(`
                    INSERT INTO order_items (
                        id, order_id, menu_item_id, quantity,
                        price, special_instructions
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    uuidv4(),
                    orderId,
                    item.menu_item_id,
                    item.quantity,
                    item.price,
                    item.special_instructions
                ]);
            }

            // Create notification for restaurant owner
            const [restaurant] = await connection.execute(
                'SELECT owner_id FROM restaurants WHERE id = ?',
                [restaurant_id]
            );

            await connection.execute(`
                INSERT INTO notifications (
                    id, user_id, title, message, type
                ) VALUES (?, ?, ?, ?, 'order')
            `, [
                uuidv4(),
                restaurant[0].owner_id,
                'New Order Received',
                `You have received a new order (#${orderId})`
            ]);

            // Commit transaction
            await connection.commit();

            // Get created order
            const [order] = await pool.execute(`
                SELECT 
                    o.*,
                    r.name as restaurant_name,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'menu_item_id', oi.menu_item_id,
                            'name', mi.name,
                            'price', oi.price,
                            'quantity', oi.quantity,
                            'special_instructions', oi.special_instructions
                        )
                    ) as items
                FROM orders o
                JOIN restaurants r ON o.restaurant_id = r.id
                JOIN order_items oi ON o.id = oi.order_id
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE o.id = ?
                GROUP BY o.id
            `, [orderId]);

            res.status(201).json({
                status: 'success',
                data: {
                    order: order[0]
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

// Update order status (protected, restaurant owner only)
router.patch('/:id/status', protect, async (req, res, next) => {
    try {
        const { status } = req.body;

        // Check if user is restaurant owner
        const [order] = await pool.execute(`
            SELECT o.*, r.owner_id 
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.id = ?
        `, [req.params.id]);

        if (!order[0]) {
            return next(new AppError('Order not found', 404));
        }

        if (order[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to update this order', 403));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update order status
            await connection.execute(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, req.params.id]
            );

            // Create notification for user
            await connection.execute(`
                INSERT INTO notifications (
                    id, user_id, title, message, type
                ) VALUES (?, ?, ?, ?, 'order')
            `, [
                uuidv4(),
                order[0].user_id,
                'Order Status Updated',
                `Your order (#${req.params.id}) status has been updated to ${status}`
            ]);

            // Commit transaction
            await connection.commit();

            // Get updated order
            const [updatedOrder] = await pool.execute(`
                SELECT 
                    o.*,
                    r.name as restaurant_name,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'menu_item_id', oi.menu_item_id,
                            'name', mi.name,
                            'price', oi.price,
                            'quantity', oi.quantity,
                            'special_instructions', oi.special_instructions
                        )
                    ) as items
                FROM orders o
                JOIN restaurants r ON o.restaurant_id = r.id
                JOIN order_items oi ON o.id = oi.order_id
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE o.id = ?
                GROUP BY o.id
            `, [req.params.id]);

            res.status(200).json({
                status: 'success',
                data: {
                    order: updatedOrder[0]
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

// Update payment status (protected, admin only)
router.patch('/:id/payment', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const { payment_status } = req.body;

        await pool.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [payment_status, req.params.id]
        );

        const [order] = await pool.execute(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                order: order[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 