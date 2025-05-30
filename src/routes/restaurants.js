const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { restaurantService, menuService } = require('../services/localStorage');

// Get all restaurants with filters
router.get('/', async (req, res, next) => {
    try {
        const {
            search,
            cuisine,
            priceRange,
            rating,
            page = 1,
            limit = 10,
            sortBy = 'rating',
            order = 'DESC'
        } = req.query;

        let restaurants = restaurantService.getAll();

        // Apply filters
        if (search) {
            restaurants = restaurants.filter(r => 
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.cuisine_type.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (cuisine) {
            restaurants = restaurants.filter(r => r.cuisine_type === cuisine);
        }

        if (priceRange) {
            restaurants = restaurants.filter(r => r.price_range === priceRange);
        }

        if (rating) {
            restaurants = restaurants.filter(r => r.rating >= parseFloat(rating));
        }

        // Apply sorting
        restaurants.sort((a, b) => {
            const field = sortBy === 'name' ? 'name' : 'rating';
            if (order === 'DESC') {
                return b[field] > a[field] ? 1 : -1;
            }
            return a[field] > b[field] ? 1 : -1;
        });

        // Apply pagination
        const start = (page - 1) * limit;
        const paginatedRestaurants = restaurants.slice(start, start + parseInt(limit));

        res.status(200).json({
            status: 'success',
            results: paginatedRestaurants.length,
            data: {
                restaurants: paginatedRestaurants,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: restaurants.length,
                    pages: Math.ceil(restaurants.length / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get restaurant by ID
router.get('/:id', async (req, res, next) => {
    try {
        const restaurant = restaurantService.getById(req.params.id);
        
        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }

        // Get menu items
        const menuItems = menuService.getAllByRestaurant(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                restaurant,
                menu: menuItems
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create restaurant (protected, restaurant_owner only)
router.post('/', protect, restrictTo('restaurant_owner', 'admin'), async (req, res, next) => {
    try {
        const restaurant = restaurantService.create({
            ...req.body,
            owner_id: req.user.id,
            rating: 0,
            rating_count: 0,
            is_active: true
        });

        res.status(201).json({
            status: 'success',
            data: {
                restaurant
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update restaurant (protected, owner only)
router.patch('/:id', protect, async (req, res, next) => {
    try {
        const restaurant = restaurantService.getById(req.params.id);

        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }

        if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to update this restaurant', 403));
        }

        const updatedRestaurant = restaurantService.update(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            data: {
                restaurant: updatedRestaurant
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete restaurant (protected, admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const restaurant = restaurantService.getById(req.params.id);

        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }

        restaurantService.delete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

// Toggle favorite restaurant (protected)
router.post('/:id/favorite', protect, async (req, res, next) => {
    try {
        const restaurant = restaurantService.getById(req.params.id);
        
        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }

        // Toggle favorite status
        const favorites = restaurant.favorites || [];
        const isFavorite = favorites.includes(req.user.id);

        if (isFavorite) {
            restaurant.favorites = favorites.filter(id => id !== req.user.id);
        } else {
            restaurant.favorites = [...favorites, req.user.id];
        }

        restaurantService.update(req.params.id, restaurant);

        res.status(200).json({
            status: 'success',
            message: isFavorite ? 'Restaurant removed from favorites' : 'Restaurant added to favorites',
            data: {
                isFavorite: !isFavorite
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 