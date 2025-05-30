const Cart = require('../models/Cart');
const Menu = require('../models/Menu');

class CartController {
    static async addItem(req, res) {
        try {
            const { menuItemId, quantity } = req.body;
            const userId = req.user.id;

            // Get menu item to check availability and get restaurant_id
            const menuItem = await Menu.findById(menuItemId);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }

            if (!menuItem.is_available) {
                return res.status(400).json({ message: 'This item is currently unavailable' });
            }

            // Check if cart is empty or contains items from the same restaurant
            const canAddItem = await Cart.checkRestaurant(userId, menuItem.restaurant_id);
            if (!canAddItem) {
                return res.status(400).json({ 
                    message: 'Cannot add items from different restaurants. Please clear your cart first.' 
                });
            }

            const cartItem = new Cart({
                user_id: userId,
                menu_item_id: menuItemId,
                quantity,
                restaurant_id: menuItem.restaurant_id
            });

            const addedItem = await Cart.addItem(cartItem);
            
            // Get updated cart for response
            const updatedCart = await Cart.getByUser(userId);
            const cartTotal = await Cart.getCartTotal(userId);

            res.status(201).json({
                message: 'Item added to cart successfully',
                items: updatedCart,
                total: cartTotal
            });
        } catch (error) {
            res.status(500).json({ message: 'Error adding item to cart', error: error.message });
        }
    }

    static async getCart(req, res) {
        try {
            const userId = req.user.id;
            const items = await Cart.getByUser(userId);
            const subtotal = await Cart.getCartSubtotal(userId);
            const deliveryFee = 5.00; // Fixed delivery fee
            const tax = subtotal * 0.08; // 8% tax
            const total = subtotal + deliveryFee + tax;

            res.json({
                items,
                subtotal,
                deliveryFee,
                tax,
                total
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cart', error: error.message });
        }
    }

    static async updateQuantity(req, res) {
        try {
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            const userId = req.user.id;

            if (quantity < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1' });
            }

            const updated = await Cart.updateQuantity(userId, cartItemId, quantity);
            if (!updated) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            // Get updated cart for response
            const items = await Cart.getByUser(userId);
            const subtotal = await Cart.getCartSubtotal(userId);
            const deliveryFee = 5.00;
            const tax = subtotal * 0.08;
            const total = subtotal + deliveryFee + tax;

            res.json({
                message: 'Cart updated successfully',
                items,
                subtotal,
                deliveryFee,
                tax,
                total
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating cart', error: error.message });
        }
    }

    static async removeItem(req, res) {
        try {
            const { cartItemId } = req.params;
            const userId = req.user.id;
            
            const removed = await Cart.removeItem(userId, cartItemId);
            if (!removed) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            // Get updated cart for response
            const items = await Cart.getByUser(userId);
            const subtotal = await Cart.getCartSubtotal(userId);
            const deliveryFee = 5.00;
            const tax = subtotal * 0.08;
            const total = subtotal + deliveryFee + tax;

            res.json({
                message: 'Item removed from cart successfully',
                items,
                subtotal,
                deliveryFee,
                tax,
                total
            });
        } catch (error) {
            res.status(500).json({ message: 'Error removing item from cart', error: error.message });
        }
    }

    static async clearCart(req, res) {
        try {
            const userId = req.user.id;
            await Cart.clearCart(userId);
            res.json({
                message: 'Cart cleared successfully',
                items: [],
                subtotal: 0,
                deliveryFee: 0,
                tax: 0,
                total: 0
            });
        } catch (error) {
            res.status(500).json({ message: 'Error clearing cart', error: error.message });
        }
    }
}

module.exports = CartController; 