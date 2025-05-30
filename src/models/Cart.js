const pool = require('../config/db.config');

class Cart {
    constructor({ user_id, menu_item_id, quantity, restaurant_id }) {
        this.user_id = user_id;
        this.menu_item_id = menu_item_id;
        this.quantity = quantity;
        this.restaurant_id = restaurant_id;
    }

    static async getByUser(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.id,
                    c.quantity,
                    m.id as menu_item_id,
                    m.name,
                    m.price,
                    m.image,
                    r.name as restaurantName
                FROM cart_items c
                JOIN menu_items m ON c.menu_item_id = m.id
                JOIN restaurants r ON m.restaurant_id = r.id
                WHERE c.user_id = ?
            `, [userId]);
            return rows;
        } catch (error) {
            console.error('Error in Cart.getByUser:', error);
            throw error;
        }
    }

    static async checkRestaurant(userId, restaurantId) {
        try {
            const [rows] = await pool.query(`
                SELECT DISTINCT m.restaurant_id
                FROM cart_items c
                JOIN menu_items m ON c.menu_item_id = m.id
                WHERE c.user_id = ?
            `, [userId]);

            if (rows.length === 0) return true; // Empty cart
            return rows[0].restaurant_id === restaurantId;
        } catch (error) {
            console.error('Error in Cart.checkRestaurant:', error);
            throw error;
        }
    }

    static async addItem(cartItem) {
        try {
            // Check if item already exists in cart
            const [existing] = await pool.query(
                'SELECT id, quantity FROM cart_items WHERE user_id = ? AND menu_item_id = ?',
                [cartItem.user_id, cartItem.menu_item_id]
            );

            if (existing.length > 0) {
                // Update quantity if item exists
                const newQuantity = existing[0].quantity + cartItem.quantity;
                await pool.query(
                    'UPDATE cart_items SET quantity = ? WHERE id = ?',
                    [newQuantity, existing[0].id]
                );
                return { ...cartItem, id: existing[0].id, quantity: newQuantity };
            }

            // Add new item if it doesn't exist
            const [result] = await pool.query(
                'INSERT INTO cart_items (user_id, menu_item_id, quantity) VALUES (?, ?, ?)',
                [cartItem.user_id, cartItem.menu_item_id, cartItem.quantity]
            );
            return { ...cartItem, id: result.insertId };
        } catch (error) {
            console.error('Error in Cart.addItem:', error);
            throw error;
        }
    }

    static async updateQuantity(userId, cartItemId, quantity) {
        try {
            const [result] = await pool.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
                [quantity, cartItemId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Cart.updateQuantity:', error);
            throw error;
        }
    }

    static async removeItem(userId, cartItemId) {
        try {
            const [result] = await pool.query(
                'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
                [cartItemId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Cart.removeItem:', error);
            throw error;
        }
    }

    static async clearCart(userId) {
        try {
            await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
            return true;
        } catch (error) {
            console.error('Error in Cart.clearCart:', error);
            throw error;
        }
    }

    static async getCartSubtotal(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT SUM(m.price * c.quantity) as subtotal
                FROM cart_items c
                JOIN menu_items m ON c.menu_item_id = m.id
                WHERE c.user_id = ?
            `, [userId]);
            return rows[0].subtotal || 0;
        } catch (error) {
            console.error('Error in Cart.getCartSubtotal:', error);
            throw error;
        }
    }
}

module.exports = Cart; 