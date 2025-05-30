const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');

class OrderController {
    static async createOrder(req, res) {
        try {
            const userId = req.user.id;
            const { deliveryAddress, paymentMethod, specialInstructions } = req.body;

            // Get cart items
            const cart = await Cart.getByUser(userId);
            if (!cart || cart.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Calculate totals
            const subtotal = await Cart.getCartSubtotal(userId);
            const deliveryFee = 5.00;
            const tax = subtotal * 0.08;
            const total = subtotal + deliveryFee + tax;

            // Create order
            const order = await Order.create({
                userId,
                items: cart,
                subtotal,
                deliveryFee,
                tax,
                total,
                deliveryAddress,
                paymentMethod,
                specialInstructions
            });

            // Clear cart after successful order creation
            await Cart.clearCart(userId);

            res.status(201).json({
                message: 'Order created successfully',
                orderId: order.id
            });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Error creating order', error: error.message });
        }
    }

    static async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await Order.getByUser(userId);
            res.json(orders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: 'Error fetching orders', error: error.message });
        }
    }

    static async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const order = await Order.getById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Ensure user can only access their own orders
            if (order.user_id !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            res.json(order);
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).json({ message: 'Error fetching order details', error: error.message });
        }
    }

    static async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;

            const order = await Order.getById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Ensure user can only cancel their own orders
            if (order.user_id !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            // Check if order can be cancelled (e.g., not already delivered)
            if (!Order.canBeCancelled(order.status)) {
                return res.status(400).json({ message: 'Order cannot be cancelled' });
            }

            await Order.cancel(orderId);
            res.json({ message: 'Order cancelled successfully' });
        } catch (error) {
            console.error('Error cancelling order:', error);
            res.status(500).json({ message: 'Error cancelling order', error: error.message });
        }
    }

    static async getRestaurantOrders(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.restaurantId);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to view restaurant orders' });
            }

            const orders = await Order.findByRestaurant(req.params.restaurantId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching restaurant orders', error: error.message });
        }
    }

    static async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await Order.findById(req.params.id);
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const restaurant = await Restaurant.findById(order.restaurant_id);
            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this order' });
            }

            const updated = await Order.updateStatus(req.params.id, status);
            if (!updated) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ message: 'Order status updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating order status', error: error.message });
        }
    }

    static async updatePaymentStatus(req, res) {
        try {
            const { payment_status } = req.body;
            const order = await Order.findById(req.params.id);
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Only admin or restaurant owner can update payment status
            if (!req.user.is_admin) {
                const restaurant = await Restaurant.findById(order.restaurant_id);
                if (restaurant.owner_id !== req.user.id) {
                    return res.status(403).json({ message: 'Not authorized to update payment status' });
                }
            }

            const updated = await Order.updatePaymentStatus(req.params.id, payment_status);
            if (!updated) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ message: 'Payment status updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating payment status', error: error.message });
        }
    }

    static async getOrderStats(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.restaurantId);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            if (restaurant.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to view restaurant stats' });
            }

            const stats = await Order.getOrderStats(req.params.restaurantId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order stats', error: error.message });
        }
    }

    static async getRecentOrders(req, res) {
        try {
            if (!req.user.is_admin) {
                return res.status(403).json({ message: 'Not authorized to view recent orders' });
            }

            const limit = parseInt(req.query.limit) || 10;
            const orders = await Order.getRecentOrders(limit);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching recent orders', error: error.message });
        }
    }
}

module.exports = OrderController; 