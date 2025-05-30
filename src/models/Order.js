const pool = require('../config/db.config');

class Order {
    static async create(orderData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (
                    user_id, subtotal, delivery_fee, tax, total,
                    delivery_address, payment_method, special_instructions,
                    status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [
                    orderData.userId,
                    orderData.subtotal,
                    orderData.deliveryFee,
                    orderData.tax,
                    orderData.total,
                    JSON.stringify(orderData.deliveryAddress),
                    orderData.paymentMethod,
                    orderData.specialInstructions
                ]
            );

            const orderId = orderResult.insertId;

            // Create order items
            const orderItemsValues = orderData.items.map(item => [
                orderId,
                item.menu_item_id,
                item.quantity,
                item.price
            ]);

            await connection.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?',
                [orderItemsValues]
            );

            await connection.commit();
            return { id: orderId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getByUser(userId) {
        try {
            const [orders] = await pool.query(`
                SELECT 
                    o.id, o.subtotal, o.delivery_fee, o.tax, o.total,
                    o.status, o.created_at, o.delivery_address,
                    o.payment_method, o.special_instructions,
                    r.name as restaurant_name
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN menu_items m ON oi.menu_item_id = m.id
                JOIN restaurants r ON m.restaurant_id = r.id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `, [userId]);

            // Get items for each order
            for (let order of orders) {
                const [items] = await pool.query(`
                    SELECT 
                        oi.quantity, oi.price,
                        m.name, m.image
                    FROM order_items oi
                    JOIN menu_items m ON oi.menu_item_id = m.id
                    WHERE oi.order_id = ?
                `, [order.id]);
                order.items = items;
                order.delivery_address = JSON.parse(order.delivery_address);
            }

            return orders;
        } catch (error) {
            console.error('Error in Order.getByUser:', error);
            throw error;
        }
    }

    static async getById(orderId) {
        try {
            const [orders] = await pool.query(`
                SELECT 
                    o.*, r.name as restaurant_name,
                    r.phone as restaurant_phone,
                    r.address as restaurant_address
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN menu_items m ON oi.menu_item_id = m.id
                JOIN restaurants r ON m.restaurant_id = r.id
                WHERE o.id = ?
                LIMIT 1
            `, [orderId]);

            if (orders.length === 0) return null;

            const order = orders[0];
            order.delivery_address = JSON.parse(order.delivery_address);

            // Get order items
            const [items] = await pool.query(`
                SELECT 
                    oi.quantity, oi.price,
                    m.name, m.image, m.description
                FROM order_items oi
                JOIN menu_items m ON oi.menu_item_id = m.id
                WHERE oi.order_id = ?
            `, [orderId]);
            order.items = items;

            return order;
        } catch (error) {
            console.error('Error in Order.getById:', error);
            throw error;
        }
    }

    static canBeCancelled(status) {
        const cancellableStatuses = ['pending', 'confirmed'];
        return cancellableStatuses.includes(status);
    }

    static async cancel(orderId) {
        try {
            await pool.query(
                'UPDATE orders SET status = "cancelled" WHERE id = ?',
                [orderId]
            );
            return true;
        } catch (error) {
            console.error('Error in Order.cancel:', error);
            throw error;
        }
    }
}

module.exports = Order; 