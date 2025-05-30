const pool = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.password = user.password;
        this.phone = user.phone;
        this.address = user.address;
        this.role = user.role || 'customer';
    }

    static async create(userData) {
        const { name, email, password, role = 'user' } = userData;
        try {
            const [result] = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, password, role]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, userData) {
        try {
            const [result] = await pool.query(
                'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
                [userData.name, userData.email, userData.phone, userData.address, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}

module.exports = User; 