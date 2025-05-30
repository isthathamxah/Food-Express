const express = require('express');
const router = express.Router();
const { userService, restaurantService, menuService, cartService, orderService } = require('../services/localStorage');
const OrderProcessingService = require('../services/OrderProcessingService');
const { protect } = require('../middleware/auth');
const deliveryRoutes = require('./delivery');

// Initialize OrderProcessingService
const orderProcessor = new OrderProcessingService();

// User routes
router.post('/auth/register', (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = userService.getByEmail(email);
        
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = userService.create({ name, email, password });
        res.status(201).json({ message: 'Registration successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

router.post('/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const user = userService.getByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Restaurant routes
router.get('/restaurants', (req, res) => {
    try {
        const { search, cuisine } = req.query;
        let restaurants = restaurantService.getAll();

        if (search) {
            restaurants = restaurants.filter(r => 
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.cuisine_type.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (cuisine) {
            restaurants = restaurants.filter(r => r.cuisine_type === cuisine);
        }

        res.json({ restaurants });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
    }
});

router.get('/restaurants/:id', (req, res) => {
    try {
        const restaurant = restaurantService.getById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const menuItems = menuService.getAllByRestaurant(req.params.id);
        res.json({ restaurant, menuItems });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
    }
});

// Cart routes
router.get('/cart/:userId', (req, res) => {
    try {
        const cartItems = cartService.getByUser(req.params.userId);
        res.json({ items: cartItems, total: cartService.getCartTotal() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

router.post('/cart/add', (req, res) => {
    try {
        const { userId, item } = req.body;
        const result = cartService.addItem({ ...item, user_id: userId });
        res.json({ message: 'Item added to cart', item: result });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
});

router.delete('/cart/:userId/:itemId', (req, res) => {
    try {
        cartService.removeItem(req.params.itemId);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
});

// Order routes
router.post('/orders', protect, (req, res) => {
    try {
        const {
            restaurant_id,
            items,
            delivery_address,
            delivery_phone,
            delivery_instructions,
            payment_method,
            subtotal,
            tax,
            delivery_fee,
            total
        } = req.body;

        // Create base order
        const order = orderService.create({
            user_id: req.user.id,
            restaurant_id,
            items,
            delivery_address,
            delivery_phone,
            delivery_instructions,
            payment_method,
            subtotal,
            tax,
            delivery_fee,
            total,
            status: 'pending',
            created_at: new Date().toISOString()
        });

        // Process order using our DSA implementation
        const processedOrder = orderProcessor.addOrder({
            ...order,
            customer: {
                id: req.user.id,
                isPremium: req.user.isPremium || false
            },
            deliveryLocation: `Location-${Math.floor(Math.random() * 4) + 1}`, // Simulate random delivery location
            isExpress: payment_method === 'card' // Assume card payments get express delivery
        });

        // Clear user's cart after successful order
        cartService.clearCart(req.user.id);

        res.status(201).json({
            status: 'success',
            data: {
                order: {
                    ...order,
                    estimatedDeliveryTime: processedOrder.estimatedTime
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

router.get('/orders/my-orders', protect, (req, res) => {
    try {
        // Try to get from cache first
        const cachedOrders = req.user.recentOrders?.map(id => orderProcessor.getOrderFromCache(id)).filter(Boolean);
        
        if (cachedOrders?.length) {
            return res.json({
                status: 'success',
                data: {
                    orders: cachedOrders
                }
            });
        }

        // If not in cache, get from storage
        const orders = orderService.getByUser(req.user.id);
        res.json({
            status: 'success',
            data: {
                orders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

router.get('/orders/:orderId', protect, (req, res) => {
    try {
        const order = orderService.getById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if user owns this order
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// Add new route for searching menu items with suggestions
router.get('/menu/search', (req, res) => {
    try {
        const { query } = req.query;
        const suggestions = orderProcessor.searchMenuItems(query);
        res.json({
            status: 'success',
            data: {
                suggestions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error searching menu items', error: error.message });
    }
});

// Add new route for getting delivery route
router.get('/delivery/route', protect, (req, res) => {
    try {
        const { orderId } = req.query;
        const order = orderService.getById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const route = orderProcessor.getDeliveryRoute('Restaurant-A', order.deliveryLocation);
        res.json({
            status: 'success',
            data: {
                route,
                estimatedTime: route.length * 10 // 10 minutes per location
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating delivery route', error: error.message });
    }
});

// Use delivery routes
router.use('/delivery', deliveryRoutes);

module.exports = router; 