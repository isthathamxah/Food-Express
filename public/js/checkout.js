class CheckoutService {
    static async createOrder(orderData) {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AuthService.updateAuthHeader()
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) throw new Error('Failed to create order');
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById('card-details');

    // Constants
    const TAX_RATE = 0.08; // 8% tax
    const DELIVERY_FEE = 2.99;

    // Initialize the page
    function init() {
        loadCartItems();
        setupEventListeners();
        setupFormValidation();
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            window.location.href = '/cart.html';
            return;
        }

        orderItemsContainer.innerHTML = cart.map(item => `
            <div class="order-item">
                <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        updateOrderSummary();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Payment method change
        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                cardDetails.style.display = this.value === 'card' ? 'block' : 'none';
                validateForm();
            });
        });

        // Place order button
        placeOrderBtn.addEventListener('click', handlePlaceOrder);

        // Form validation
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', validateForm);
            input.addEventListener('blur', function() {
                this.classList.add('touched');
                validateForm();
            });
        });
    }

    // Set up form validation
    function setupFormValidation() {
        // Add input masks
        const cardNumber = document.getElementById('card-number');
        const expiry = document.getElementById('expiry');
        const cvv = document.getElementById('cvv');
        const phone = document.getElementById('phone');

        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value.substring(0, 19);
            });
        }

        if (expiry) {
            expiry.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                }
                e.target.value = value.substring(0, 5);
            });
        }

        if (cvv) {
            cvv.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }

        if (phone) {
            phone.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                    value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
                } else if (value.length >= 3) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                e.target.value = value.substring(0, 12);
            });
        }
    }

    // Update order summary
    function updateOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('itemCount').textContent = itemCount;

        // Group items by restaurant
        const itemsByRestaurant = cart.reduce((acc, item) => {
            if (!acc[item.restaurantName]) {
                acc[item.restaurantName] = [];
            }
            acc[item.restaurantName].push(item);
            return acc;
        }, {});

        // Generate order summary HTML
        const orderSummaryHTML = Object.entries(itemsByRestaurant).map(([restaurantName, items]) => `
            <div class="restaurant-items mb-4">
                <h6 class="restaurant-name mb-3">${restaurantName}</h6>
                ${items.map(item => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center">
                            <span class="item-quantity me-2">${item.quantity}×</span>
                            <span class="item-name">${item.name}</span>
                        </div>
                        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `).join('<hr class="my-3">');

        document.getElementById('orderSummary').innerHTML = orderSummaryHTML;

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const deliveryFee = 2.99;
        const total = subtotal + tax + deliveryFee;

        // Update price display
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('deliveryFee').textContent = `$${deliveryFee.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    // Validate form inputs
    function validateForm() {
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                if (field.classList.contains('touched')) {
                    field.classList.add('invalid');
                }
            } else {
                field.classList.remove('invalid');
            }
        });

        // Additional validation for card details if card payment is selected
        const cardPayment = document.querySelector('input[name="payment"][value="card"]');
        if (cardPayment && cardPayment.checked) {
            const cardNumber = document.getElementById('card-number');
            const expiry = document.getElementById('expiry');
            const cvv = document.getElementById('cvv');

            if (cardNumber && !validateCardNumber(cardNumber.value)) {
                isValid = false;
                cardNumber.classList.add('invalid');
            }
            if (expiry && !validateExpiry(expiry.value)) {
                isValid = false;
                expiry.classList.add('invalid');
            }
            if (cvv && !validateCVV(cvv.value)) {
                isValid = false;
                cvv.classList.add('invalid');
            }
        }

        placeOrderBtn.disabled = !isValid;
        return isValid;
    }

    // Card number validation (basic)
    function validateCardNumber(number) {
        const cleaned = number.replace(/\s/g, '');
        return cleaned.length === 16 && /^\d+$/.test(cleaned);
    }

    // Expiry date validation (MM/YY format)
    function validateExpiry(expiry) {
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(expiry)) return false;

        const [month, year] = expiry.split('/');
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (expiryYear < currentYear) return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

        return true;
    }

    // CVV validation (3 or 4 digits)
    function validateCVV(cvv) {
        const cleaned = cvv.replace(/\D/g, '');
        return cleaned.length >= 3 && cleaned.length <= 4;
    }

    // Handle place order
    async function handlePlaceOrder(e) {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        try {
            // Show loading state
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Get cart items
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Calculate totals
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.08; // 8% tax
            const deliveryFee = 2.99;
            const total = subtotal + tax + deliveryFee;

            // Create order object
            const orderData = {
                id: generateOrderId(),
                restaurant_id: cartItems[0].restaurantId,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                delivery_address: {
                    street: document.getElementById('address').value,
                    details: document.getElementById('addressDetails').value || '',
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zipCode: document.getElementById('zipCode').value
                },
                delivery_phone: document.getElementById('phone')?.value || '',
                delivery_instructions: document.getElementById('deliveryInstructions').value || '',
                payment_method: document.querySelector('input[name="payment"]:checked').value,
                subtotal,
                tax,
                delivery_fee: deliveryFee,
                total,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Add to priority queue for processing
            window.DSA.orderQueue.enqueue(orderData);

            // Add to LRU cache for quick access
            window.DSA.orderCache.put(orderData.id, orderData);

            // Send order to server
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AuthService.updateAuthHeader()
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            const { data } = await response.json();

            // Clear cart
            localStorage.removeItem('cart');
            
            // Show success message
            showToast('Order placed successfully!');

            // Redirect to orders page after a short delay
            setTimeout(() => {
                window.location.href = '/orders.html';
        }, 2000);

        } catch (error) {
            console.error('Error placing order:', error);
            showToast(error.message || 'Failed to place order. Please try again.', 'error');
        } finally {
            // Reset button state
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Place Order';
        }
    }

    // Generate unique order ID
    function generateOrderId() {
        return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Show toast message
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Update cart count in navigation
    function updateCartCount(count) {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            if (count === 0) {
                cartCount.style.display = 'none';
            } else {
                cartCount.style.display = 'flex';
            }
        }
    }

    // Initialize the page
    init();
});

// Cart Management System using Efficient Data Structures
class CartManagementSystem {
    constructor() {
        // Hash Map for O(1) item lookup and updates
        this.itemsMap = new Map();
        // Min Heap for price-based operations
        this.priceHeap = new MinHeap();
        // Hash Map for restaurant grouping
        this.restaurantGroups = new Map();
    }

    // Time Complexity: O(log n) for heap operations
    addItem(item) {
        const existingItem = this.itemsMap.get(item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
            this.updatePriceHeap(existingItem);
        } else {
            this.itemsMap.set(item.id, item);
            this.priceHeap.insert({
                id: item.id,
                price: item.price * item.quantity
            });
        }

        // Update restaurant grouping
        if (!this.restaurantGroups.has(item.restaurantName)) {
            this.restaurantGroups.set(item.restaurantName, new Set());
        }
        this.restaurantGroups.get(item.restaurantName).add(item.id);
    }

    // Time Complexity: O(log n)
    updatePriceHeap(item) {
        this.priceHeap.update(item.id, item.price * item.quantity);
    }

    // Time Complexity: O(1)
    getItemById(itemId) {
        return this.itemsMap.get(itemId);
    }

    // Time Complexity: O(1)
    getItemsByRestaurant(restaurantName) {
        const itemIds = this.restaurantGroups.get(restaurantName) || new Set();
        return Array.from(itemIds).map(id => this.itemsMap.get(id));
    }

    // Time Complexity: O(1)
    calculateTotal() {
        let subtotal = 0;
        for (const item of this.itemsMap.values()) {
            subtotal += item.price * item.quantity;
        }
        const tax = subtotal * 0.08; // 8% tax
        const deliveryFee = 2.99;
        return {
            subtotal,
            tax,
            deliveryFee,
            total: subtotal + tax + deliveryFee
        };
    }

    // Time Complexity: O(1)
    getRestaurantCount() {
        return this.restaurantGroups.size;
    }

    // Time Complexity: O(1)
    getTotalItems() {
        let total = 0;
        for (const item of this.itemsMap.values()) {
            total += item.quantity;
        }
        return total;
    }
}

// Min Heap Implementation for Price-based Operations
class MinHeap {
    constructor() {
        this.heap = [];
        this.indices = new Map(); // For O(1) lookups
    }

    insert(node) {
        this.heap.push(node);
        this.indices.set(node.id, this.heap.length - 1);
        this._bubbleUp(this.heap.length - 1);
    }

    update(id, newPrice) {
        const index = this.indices.get(id);
        if (index === undefined) return;

        const oldPrice = this.heap[index].price;
        this.heap[index].price = newPrice;

        if (newPrice < oldPrice) {
            this._bubbleUp(index);
        } else {
            this._bubbleDown(index);
        }
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].price <= this.heap[index].price) break;

            this._swap(index, parentIndex);
            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild < this.heap.length && 
                this.heap[leftChild].price < this.heap[smallest].price) {
                smallest = leftChild;
            }

            if (rightChild < this.heap.length && 
                this.heap[rightChild].price < this.heap[smallest].price) {
                smallest = rightChild;
            }

            if (smallest === index) break;

            this._swap(index, smallest);
            index = smallest;
        }
    }

    _swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;

        this.indices.set(this.heap[i].id, i);
        this.indices.set(this.heap[j].id, j);
    }
}

// Initialize Cart Management System
const cartSystem = new CartManagementSystem();

// Load cart items with efficient data structures
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        window.location.href = '/cart.html';
        return;
    }

    // Load items into the cart system
    cart.forEach(item => cartSystem.addItem(item));
    updateOrderSummary();
}

// Update order summary with optimized calculations
function updateOrderSummary() {
    const itemCount = cartSystem.getTotalItems();
    document.getElementById('itemCount').textContent = itemCount;

    // Generate order summary HTML with restaurant grouping
    const orderSummaryHTML = Array.from(cartSystem.restaurantGroups.entries())
        .map(([restaurantName, itemIds]) => {
            const items = Array.from(itemIds)
                .map(id => cartSystem.getItemById(id));
            
            return `
                <div class="restaurant-items mb-4">
                    <h6 class="restaurant-name mb-3">${restaurantName}</h6>
                    ${items.map(item => `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div class="d-flex align-items-center">
                                <span class="item-quantity me-2">${item.quantity}×</span>
                                <span class="item-name">${item.name}</span>
                            </div>
                            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('<hr class="my-3">');

    document.getElementById('orderSummary').innerHTML = orderSummaryHTML;

    // Update totals with efficient calculation
    const { subtotal, tax, deliveryFee, total } = cartSystem.calculateTotal();
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('deliveryFee').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
} 