// Cart utility functions
const CartUtils = {
    // Get cart items from localStorage
    getCartItems() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    // Save cart items to localStorage
    saveCartItems(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCartCount();
        this.dispatchCartUpdateEvent();
    },

    // Add item to cart
    async addToCart(item) {
        if (!item || !item.id) return false;
        
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                throw new Error('Please login to add items to cart');
            }

            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    item
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            const cartItems = this.getCartItems();
            const existingItem = cartItems.find(i => i.id === item.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({
                    ...item,
                    quantity: 1
                });
            }

            this.saveCartItems(cartItems);
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.message);
            return false;
        }
    },

    // Remove item from cart
    async removeFromCart(itemId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                throw new Error('Please login to remove items from cart');
            }

            const response = await fetch(`/api/cart/${currentUser.id}/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            const cartItems = this.getCartItems();
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            this.saveCartItems(updatedItems);
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert(error.message);
        }
    },

    // Update item quantity
    async updateQuantity(itemId, quantity) {
        try {
            if (quantity <= 0) {
                return this.removeFromCart(itemId);
            }

            const cartItems = this.getCartItems();
            const item = cartItems.find(item => item.id === itemId);
            
            if (item) {
                item.quantity = quantity;
                this.saveCartItems(cartItems);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert(error.message);
        }
    },

    // Clear cart
    clearCart() {
        localStorage.setItem('cart', JSON.stringify([]));
        this.updateCartCount();
        this.dispatchCartUpdateEvent();
    },

    // Get cart total
    getCartTotal() {
        const cartItems = this.getCartItems();
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Update cart count in UI
    updateCartCount() {
        const cartItems = this.getCartItems();
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count, #cartCount').forEach(element => {
            if (element) {
                element.textContent = totalItems;
            }
        });
    },

    // Dispatch custom event when cart is updated
    dispatchCartUpdateEvent() {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                items: this.getCartItems(),
                total: this.getCartTotal()
            }
        });
        document.dispatchEvent(event);
    }
};

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    CartUtils.updateCartCount();

    // Listen for cart updates
    document.addEventListener('cartUpdated', () => {
        CartUtils.updateCartCount();
    });
});

// Make CartUtils available globally
window.CartUtils = CartUtils;

class CartService {
    static async getCart() {
        try {
            const response = await fetch('/api/cart', {
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to fetch cart');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { items: [], total: 0 };
        }
    }

    static async addToCart(menuItemId, quantity = 1) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AuthService.updateAuthHeader()
                },
                body: JSON.stringify({ menuItemId, quantity })
            });
            if (!response.ok) throw new Error('Failed to add item to cart');
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    static async updateQuantity(cartItemId, quantity) {
        try {
            const response = await fetch(`/api/cart/update/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...AuthService.updateAuthHeader()
                },
                body: JSON.stringify({ quantity })
            });
            if (!response.ok) throw new Error('Failed to update quantity');
            return await response.json();
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    }

    static async removeFromCart(cartItemId) {
        try {
            const response = await fetch(`/api/cart/remove/${cartItemId}`, {
                method: 'DELETE',
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to remove item from cart');
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    static async clearCart() {
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'DELETE',
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to clear cart');
            return await response.json();
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }
}

// Cart page functionality
document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Update cart UI
    async function updateCartUI() {
        try {
            const cart = await CartService.getCart();
            
            if (!cart.items || cart.items.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <a href="/restaurants.html" class="btn">Browse Restaurants</a>
                    </div>
                `;
                if (cartSummary) cartSummary.style.display = 'none';
                if (checkoutBtn) checkoutBtn.style.display = 'none';
                return;
            }

            // Update cart items
            cartItemsContainer.innerHTML = cart.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image || 'images/default-food.jpg'}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p class="restaurant">${item.restaurantName}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // Update cart summary
            if (cartSummary) {
                cartSummary.innerHTML = `
                    <div class="summary-item">
                        <span>Subtotal</span>
                        <span>$${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Delivery Fee</span>
                        <span>$${cart.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax</span>
                        <span>$${cart.tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Total</span>
                        <span>$${cart.total.toFixed(2)}</span>
                    </div>
                `;
                cartSummary.style.display = 'block';
            }

            if (checkoutBtn) checkoutBtn.style.display = 'block';
        } catch (error) {
            console.error('Error updating cart UI:', error);
            alert('Failed to update cart. Please try again.');
        }
    }

    // Event Listeners
    cartItemsContainer.addEventListener('click', async (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const itemId = cartItem.dataset.id;

        if (e.target.closest('.remove-item')) {
            try {
                await CartService.removeFromCart(itemId);
                updateCartUI();
            } catch (error) {
                alert('Failed to remove item. Please try again.');
            }
        } else if (e.target.closest('.quantity-btn')) {
            const isPlus = e.target.closest('.plus');
            const quantitySpan = cartItem.querySelector('.quantity');
            let newQuantity = parseInt(quantitySpan.textContent) + (isPlus ? 1 : -1);

            if (newQuantity < 1) return;

            try {
                await CartService.updateQuantity(itemId, newQuantity);
                updateCartUI();
            } catch (error) {
                alert('Failed to update quantity. Please try again.');
            }
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }

    // Initialize cart
    updateCartUI();
}); 