const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/db.config');

// Get all addresses for a user
router.get('/', protect, async (req, res, next) => {
    try {
        const [addresses] = await pool.execute(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                addresses
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create new address
router.post('/', protect, async (req, res, next) => {
    try {
        const {
            address_type,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            is_default
        } = req.body;

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // If this address is set as default, unset other default addresses
            if (is_default) {
                await connection.execute(
                    'UPDATE addresses SET is_default = false WHERE user_id = ?',
                    [req.user.id]
                );
            }

            // Create address
            const addressId = uuidv4();
            await connection.execute(`
                INSERT INTO addresses (
                    id, user_id, address_type, address_line1, address_line2,
                    city, state, postal_code, is_default
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                addressId,
                req.user.id,
                address_type,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                is_default
            ]);

            // Commit transaction
            await connection.commit();

            // Get created address
            const [address] = await pool.execute(
                'SELECT * FROM addresses WHERE id = ?',
                [addressId]
            );

            res.status(201).json({
                status: 'success',
                data: {
                    address: address[0]
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

// Update address
router.patch('/:id', protect, async (req, res, next) => {
    try {
        const {
            address_type,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            is_default
        } = req.body;

        // Check if address exists and belongs to user
        const [address] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!address[0]) {
            return next(new AppError('Address not found', 404));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // If this address is set as default, unset other default addresses
            if (is_default) {
                await connection.execute(
                    'UPDATE addresses SET is_default = false WHERE user_id = ? AND id != ?',
                    [req.user.id, req.params.id]
                );
            }

            // Update address
            await connection.execute(`
                UPDATE addresses 
                SET 
                    address_type = ?,
                    address_line1 = ?,
                    address_line2 = ?,
                    city = ?,
                    state = ?,
                    postal_code = ?,
                    is_default = ?
                WHERE id = ?
            `, [
                address_type,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                is_default,
                req.params.id
            ]);

            // Commit transaction
            await connection.commit();

            // Get updated address
            const [updatedAddress] = await pool.execute(
                'SELECT * FROM addresses WHERE id = ?',
                [req.params.id]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    address: updatedAddress[0]
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

// Delete address
router.delete('/:id', protect, async (req, res, next) => {
    try {
        // Check if address exists and belongs to user
        const [address] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!address[0]) {
            return next(new AppError('Address not found', 404));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete address
            await connection.execute(
                'DELETE FROM addresses WHERE id = ?',
                [req.params.id]
            );

            // If this was the default address, set another address as default
            if (address[0].is_default) {
                const [addresses] = await connection.execute(
                    'SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                    [req.user.id]
                );

                if (addresses.length > 0) {
                    await connection.execute(
                        'UPDATE addresses SET is_default = true WHERE id = ?',
                        [addresses[0].id]
                    );
                }
            }

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

// Set address as default
router.patch('/:id/default', protect, async (req, res, next) => {
    try {
        // Check if address exists and belongs to user
        const [address] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!address[0]) {
            return next(new AppError('Address not found', 404));
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Unset other default addresses
            await connection.execute(
                'UPDATE addresses SET is_default = false WHERE user_id = ?',
                [req.user.id]
            );

            // Set this address as default
            await connection.execute(
                'UPDATE addresses SET is_default = true WHERE id = ?',
                [req.params.id]
            );

            // Commit transaction
            await connection.commit();

            // Get updated address
            const [updatedAddress] = await pool.execute(
                'SELECT * FROM addresses WHERE id = ?',
                [req.params.id]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    address: updatedAddress[0]
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

module.exports = router; 