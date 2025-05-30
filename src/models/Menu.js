const db = require('../config/db.config');

class Menu {
    constructor(menuItem) {
        this.restaurant_id = menuItem.restaurant_id;
        this.name = menuItem.name;
        this.description = menuItem.description;
        this.price = menuItem.price;
        this.category = menuItem.category;
        this.image_url = menuItem.image_url;
        this.is_available = menuItem.is_available || true;
        this.preparation_time = menuItem.preparation_time;
    }

    static async create(newMenuItem) {
        try {
            const [result] = await db.query(
                'INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available, preparation_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newMenuItem.restaurant_id,
                    newMenuItem.name,
                    newMenuItem.description,
                    newMenuItem.price,
                    newMenuItem.category,
                    newMenuItem.image_url,
                    newMenuItem.is_available,
                    newMenuItem.preparation_time
                ]
            );
            return { id: result.insertId, ...newMenuItem };
        } catch (error) {
            throw error;
        }
    }

    static async findByRestaurant(restaurantId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = true',
                [restaurantId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, menuData) {
        try {
            const [result] = await db.query(
                'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?, preparation_time = ? WHERE id = ?',
                [
                    menuData.name,
                    menuData.description,
                    menuData.price,
                    menuData.category,
                    menuData.image_url,
                    menuData.is_available,
                    menuData.preparation_time,
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateAvailability(id, isAvailable) {
        try {
            const [result] = await db.query(
                'UPDATE menu_items SET is_available = ? WHERE id = ?',
                [isAvailable, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async searchByRestaurant(restaurantId, query) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = true AND (name LIKE ? OR description LIKE ? OR category LIKE ?)',
                [restaurantId, `%${query}%`, `%${query}%`, `%${query}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getCategories(restaurantId) {
        try {
            const [rows] = await db.query(
                'SELECT DISTINCT category FROM menu_items WHERE restaurant_id = ? AND is_available = true',
                [restaurantId]
            );
            return rows.map(row => row.category);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Menu; 