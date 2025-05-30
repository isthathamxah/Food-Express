const Restaurant = require('../models/Restaurant');

class RestaurantController {
    static async create(req, res) {
        try {
            const restaurant = new Restaurant({
                ...req.body,
                owner_id: req.user.id
            });

            const newRestaurant = await Restaurant.create(restaurant);
            res.status(201).json({
                message: 'Restaurant created successfully',
                restaurant: newRestaurant
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating restaurant', error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const restaurants = await Restaurant.findAll();
            res.json(restaurants);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            res.json(restaurant);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
        }
    }

    static async getByOwner(req, res) {
        try {
            const restaurants = await Restaurant.findByOwner(req.user.id);
            res.json(restaurants);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this restaurant' });
            }

            const updated = await Restaurant.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            res.json({ message: 'Restaurant updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating restaurant', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
            }

            const deleted = await Restaurant.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            res.json({ message: 'Restaurant deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }

            const restaurants = await Restaurant.search(query);
            res.json(restaurants);
        } catch (error) {
            res.status(500).json({ message: 'Error searching restaurants', error: error.message });
        }
    }

    static async updateRating(req, res) {
        try {
            const { rating } = req.body;
            if (rating < 0 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 0 and 5' });
            }

            const updated = await Restaurant.updateRating(req.params.id, rating);
            if (!updated) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            res.json({ message: 'Rating updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating rating', error: error.message });
        }
    }
}

module.exports = RestaurantController; 