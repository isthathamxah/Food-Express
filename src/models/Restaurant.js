const db = require('../config/db.config');

class Restaurant {
    constructor(restaurant) {
        this.name = restaurant.name;
        this.description = restaurant.description;
        this.address = restaurant.address;
        this.phone = restaurant.phone;
        this.owner_id = restaurant.owner_id;
        this.image_url = restaurant.image_url;
        this.cuisine_type = restaurant.cuisine_type;
        this.rating = restaurant.rating || 0;
        this.is_active = restaurant.is_active || true;
    }

    static async create(newRestaurant) {
        try {
            const [result] = await db.query(
                'INSERT INTO restaurants (name, description, address, phone, owner_id, image_url, cuisine_type, rating, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newRestaurant.name,
                    newRestaurant.description,
                    newRestaurant.address,
                    newRestaurant.phone,
                    newRestaurant.owner_id,
                    newRestaurant.image_url,
                    newRestaurant.cuisine_type,
                    newRestaurant.rating,
                    newRestaurant.is_active
                ]
            );
            return { id: result.insertId, ...newRestaurant };
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM restaurants WHERE is_active = true');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByOwner(ownerId) {
        try {
            const [rows] = await db.query('SELECT * FROM restaurants WHERE owner_id = ?', [ownerId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, restaurantData) {
        try {
            const [result] = await db.query(
                'UPDATE restaurants SET name = ?, description = ?, address = ?, phone = ?, image_url = ?, cuisine_type = ?, is_active = ? WHERE id = ?',
                [
                    restaurantData.name,
                    restaurantData.description,
                    restaurantData.address,
                    restaurantData.phone,
                    restaurantData.image_url,
                    restaurantData.cuisine_type,
                    restaurantData.is_active,
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
            const [result] = await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async search(query) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM restaurants WHERE is_active = true AND (name LIKE ? OR description LIKE ? OR cuisine_type LIKE ?)',
                [`%${query}%`, `%${query}%`, `%${query}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateRating(id, newRating) {
        try {
            const [result] = await db.query(
                'UPDATE restaurants SET rating = ? WHERE id = ?',
                [newRating, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Restaurant; 