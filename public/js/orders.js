class OrderService {
    static async getOrders() {
        try {
            const response = await fetch('/api/orders', {
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    static async getOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to fetch order details');
            return await response.json();
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    static async cancelOrder(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: AuthService.updateAuthHeader()
            });
            if (!response.ok) throw new Error('Failed to cancel order');
            return await response.json();
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/login.html?redirect=/orders.html';
        return;
    }

    const ordersContainer = document.querySelector('.orders-container');
    const orderDetails = document.querySelector('.order-details');
    let selectedOrder = null;

    // Format date
    function formatDate(dateString) {
        const options = { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Get status badge class
    function getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'badge-warning',
            'confirmed': 'badge-info',
            'preparing': 'badge-primary',
            'delivering': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger'
        };
        return statusClasses[status] || 'badge-secondary';
    }

    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders/my-orders', {
                headers: {
                    ...AuthService.updateAuthHeader()
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const { data } = await response.json();
            const orders = data.orders;

            if (orders.length === 0) {
                ordersList.style.display = 'none';
                noOrders.style.display = 'block';
                return;
            }

            ordersList.style.display = 'block';
            noOrders.style.display = 'none';

            // Display orders in reverse chronological order
            ordersList.innerHTML = orders.reverse().map(order => `
                <div class="order-card mb-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Order #${order.id.slice(-6)}</h5>
                            <span class="badge bg-${getStatusColor(order.status)}">${formatStatus(order.status)}</span>
                        </div>
                        <div class="card-body">
                            <div class="order-info mb-3">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p class="mb-1"><strong>Date:</strong> ${formatDate(order.created_at)}</p>
                                        <p class="mb-1"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p class="mb-1"><strong>Items:</strong> ${getTotalItems(order.items)}</p>
                                        <p class="mb-1"><strong>Delivery to:</strong> ${formatAddress(order.delivery_address)}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="order-items mb-3">
                                <h6 class="mb-2">Order Items:</h6>
                                ${order.items.map(item => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span>${item.quantity}x ${item.name}</span>
                                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-actions">
                                <button class="btn btn-outline-primary btn-sm view-details" data-order-id="${order.id}">
                                    View Details
                                </button>
                                ${order.status === 'pending' ? `
                                    <button class="btn btn-outline-danger btn-sm ms-2 cancel-order" data-order-id="${order.id}">
                                        Cancel Order
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add event listeners to the buttons
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', () => {
                    const orderId = button.dataset.orderId;
                    viewOrderDetails(orderId);
                });
            });

            document.querySelectorAll('.cancel-order').forEach(button => {
                button.addEventListener('click', async () => {
                    const orderId = button.dataset.orderId;
                    if (confirm('Are you sure you want to cancel this order?')) {
                        try {
                            await cancelOrder(orderId);
                            showToast('Order cancelled successfully');
                            loadOrders(); // Reload the orders list
                        } catch (error) {
                            showToast('Failed to cancel order', 'error');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Failed to load orders. Please try again.', 'error');
        }
    }

    // Load order details
    async function loadOrderDetails(orderId) {
        try {
            const order = await OrderService.getOrderDetails(orderId);
            selectedOrder = order;

            orderDetails.innerHTML = `
                <div class="order-details-content">
                    <div class="order-details-header">
                        <h2>Order #${order.orderNumber}</h2>
                        <span class="badge ${getStatusBadgeClass(order.status)}">
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>
                    <div class="order-details-info">
                        <div class="info-group">
                            <h3>Restaurant</h3>
                            <p>${order.restaurantName}</p>
                        </div>
                        <div class="info-group">
                            <h3>Delivery Address</h3>
                            <p>${order.deliveryAddress.street}</p>
                            <p>${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}</p>
                        </div>
                        <div class="info-group">
                            <h3>Order Time</h3>
                            <p>${formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <div class="order-items">
                        <h3>Items</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                                <div class="item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">x${item.quantity}</span>
                                </div>
                                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Delivery Fee</span>
                            <span>$${order.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax</span>
                            <span>$${order.tax.toFixed(2)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${order.total.toFixed(2)}</span>
                        </div>
                                </div>
                    ${order.status === 'pending' ? `
                        <div class="order-actions">
                            <button class="btn btn-danger cancel-order">Cancel Order</button>
                        </div>
                    ` : ''}
            </div>
        `;

            orderDetails.style.display = 'block';
        } catch (error) {
            console.error('Error loading order details:', error);
            alert('Failed to load order details. Please try again.');
        }
    }

    // Event Listeners
    ordersContainer.addEventListener('click', async (e) => {
        const orderCard = e.target.closest('.order-card');
        if (!orderCard) return;

        const orderId = orderCard.dataset.id;

        if (e.target.closest('.view-details')) {
            loadOrderDetails(orderId);
        } else if (e.target.closest('.cancel-order')) {
            if (confirm('Are you sure you want to cancel this order?')) {
                try {
                    await OrderService.cancelOrder(orderId);
                    alert('Order cancelled successfully');
                    loadOrders();
                    if (selectedOrder && selectedOrder.id === orderId) {
                        loadOrderDetails(orderId);
                    }
                } catch (error) {
                    alert('Failed to cancel order. Please try again.');
                }
            }
        }
    });

    orderDetails.addEventListener('click', async (e) => {
        if (e.target.closest('.cancel-order') && selectedOrder) {
            if (confirm('Are you sure you want to cancel this order?')) {
                try {
                    await OrderService.cancelOrder(selectedOrder.id);
                    alert('Order cancelled successfully');
                    loadOrders();
                    loadOrderDetails(selectedOrder.id);
                } catch (error) {
                    alert('Failed to cancel order. Please try again.');
                }
            }
        }
    });

    // Check for specific order ID in URL
    const params = new URLSearchParams(window.location.search);
    const specificOrderId = params.get('id');

    // Initialize page
    await loadOrders();
    if (specificOrderId) {
        loadOrderDetails(specificOrderId);
    }
});

// Data Structure: Order Management System
class OrderManagementSystem {
    constructor() {
        // Hash Map for O(1) order lookup
        this.ordersMap = new Map();
        // Binary Search Tree for date-based sorting
        this.ordersByDate = new BinarySearchTree();
        // Hash Map for O(1) status-based filtering
        this.ordersByStatus = new Map();
        
        // Add route optimizer
        this.routeOptimizer = window.RouteOptimizer;
        this.deliveryRoutes = new Map();
    }

    // Time Complexity: O(log n) for BST insertion
    addOrder(order) {
        // Add to hash map for O(1) lookup
        this.ordersMap.set(order.id, order);
        
        // Add to BST for date-based sorting
        this.ordersByDate.insert({
            key: new Date(order.orderDate).getTime(),
            value: order.id
        });

        // Add to status map for O(1) filtering
        if (!this.ordersByStatus.has(order.status)) {
            this.ordersByStatus.set(order.status, new Set());
        }
        this.ordersByStatus.get(order.status).add(order.id);
    }

    // Time Complexity: O(1)
    getOrderById(orderId) {
        return this.ordersMap.get(orderId);
    }

    // Time Complexity: O(1)
    getOrdersByStatus(status) {
        const orderIds = this.ordersByStatus.get(status) || new Set();
        return Array.from(orderIds).map(id => this.ordersMap.get(id));
    }

    // Time Complexity: O(n) where n is number of filtered orders
    filterOrders(filterStrategy) {
        return Array.from(this.ordersMap.values()).filter(filterStrategy);
    }

    // Calculate optimal delivery route for a batch of orders
    calculateBatchDeliveryRoute(orders) {
        // Get restaurant and delivery locations
        const locations = new Set();
        const deliveryStops = [];
        let restaurantLocation = null;

        orders.forEach(order => {
            // Add restaurant location
            if (!restaurantLocation) {
                restaurantLocation = order.restaurantId;
                this.routeOptimizer.addLocation(
                    order.restaurantId,
                    order.restaurantName,
                    order.restaurant.latitude,
                    order.restaurant.longitude
                );
            }

            // Add delivery location
            const deliveryId = `D${order.id}`;
            this.routeOptimizer.addLocation(
                deliveryId,
                `Delivery for Order #${order.id}`,
                order.delivery.latitude,
                order.delivery.longitude
            );
            deliveryStops.push(deliveryId);

            // Calculate and add route between restaurant and delivery location
            const distance = this.routeOptimizer.calculateDistance(
                order.restaurant.latitude,
                order.restaurant.longitude,
                order.delivery.latitude,
                order.delivery.longitude
            );
            this.routeOptimizer.addRoute(order.restaurantId, deliveryId, distance);

            // Add routes between delivery locations
            deliveryStops.forEach(existingStop => {
                if (existingStop !== deliveryId) {
                    const existingLocation = this.routeOptimizer.locations.get(existingStop);
                    const distance = this.routeOptimizer.calculateDistance(
                        order.delivery.latitude,
                        order.delivery.longitude,
                        existingLocation.latitude,
                        existingLocation.longitude
                    );
                    this.routeOptimizer.addRoute(deliveryId, existingStop, distance);
                }
            });
        });

        // Calculate optimal route
        const optimalRoute = this.routeOptimizer.calculateDeliveryRoute(
            restaurantLocation,
            deliveryStops
        );

        // Get route information
        const routeInfo = this.routeOptimizer.getRouteInfo(optimalRoute);

        // Store route for the batch
        const batchId = this.generateBatchId();
        this.deliveryRoutes.set(batchId, {
            route: routeInfo,
            orders: orders.map(order => order.id),
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        return {
            batchId,
            ...routeInfo
        };
    }

    // Update delivery route status
    updateDeliveryRouteStatus(batchId, status, currentLocation) {
        const route = this.deliveryRoutes.get(batchId);
        if (route) {
            route.status = status;
            if (currentLocation) {
                route.currentLocation = currentLocation;
            }
            this.deliveryRoutes.set(batchId, route);

            // Update associated orders
            route.orders.forEach(orderId => {
                const order = this.ordersMap.get(orderId);
                if (order) {
                    order.status = status;
                    order.currentLocation = currentLocation;
                    this.ordersMap.set(orderId, order);
                }
            });
        }
    }

    // Get active delivery routes
    getActiveDeliveryRoutes() {
        const activeRoutes = [];
        for (const [batchId, route] of this.deliveryRoutes) {
            if (route.status !== 'completed' && route.status !== 'cancelled') {
                activeRoutes.push({
                    batchId,
                    ...route
                });
            }
        }
        return activeRoutes;
    }

    // Get route status and ETA for an order
    getOrderDeliveryStatus(orderId) {
        // Find the batch containing this order
        for (const [batchId, route] of this.deliveryRoutes) {
            if (route.orders.includes(orderId)) {
                const order = this.ordersMap.get(orderId);
                const routeInfo = route.route;
                
                // Calculate remaining time based on current position in route
                let remainingTime = routeInfo.estimatedTime;
                if (route.currentLocation) {
                    const currentIndex = routeInfo.locations.findIndex(loc => 
                        loc.id === route.currentLocation
                    );
                    const orderIndex = routeInfo.locations.findIndex(loc => 
                        loc.id === `D${orderId}`
                    );
                    
                    if (currentIndex !== -1 && orderIndex !== -1) {
                        // Calculate remaining distance and time
                        const remainingLocations = routeInfo.locations.slice(
                            currentIndex,
                            orderIndex + 1
                        );
                        const remainingDistance = this.routeOptimizer.calculatePathDistance(
                            remainingLocations.map(loc => loc.id)
                        );
                        remainingTime = this.routeOptimizer.calculateEstimatedTime(
                            remainingLocations.map(loc => loc.id)
                        );
                    }
                }

                return {
                    status: route.status,
                    batchId,
                    estimatedTime: remainingTime,
                    currentLocation: route.currentLocation,
                    route: routeInfo
                };
            }
        }
        return null;
    }

    generateBatchId() {
        return 'B' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Binary Search Tree Implementation for Date-based Sorting
class BSTNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(data) {
        const node = new BSTNode(data);
        if (!this.root) {
            this.root = node;
            return;
        }
        this._insertNode(this.root, node);
    }

    _insertNode(node, newNode) {
        if (newNode.data.key < node.data.key) {
            if (!node.left) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            if (!node.right) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    // Inorder traversal for sorted results
    inorderTraversal(callback) {
        this._inorderTraversal(this.root, callback);
    }

    _inorderTraversal(node, callback) {
        if (node) {
            this._inorderTraversal(node.left, callback);
            callback(node.data);
            this._inorderTraversal(node.right, callback);
        }
    }
}

// Strategy Pattern for Order Filtering
const FilterStrategies = {
    all: () => true,
    active: order => !['delivered', 'cancelled'].includes(order.status),
    completed: order => ['delivered', 'cancelled'].includes(order.status)
};

// Initialize Order Management System
const orderSystem = new OrderManagementSystem();

// State management with efficient data structures
let currentUser = null;
let currentFilter = 'all';

// DOM Elements
const ordersList = document.getElementById('ordersList');
const noOrders = document.getElementById('noOrders');
const loginBtn = document.getElementById('loginBtn');
const filterButtons = document.querySelectorAll('[data-filter]');

// Initialize page with optimized data loading
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateAuthUI();
        loadOrders();
    } else {
        window.location.href = '/';
        return;
    }

    // Set up filter buttons with Strategy Pattern
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            displayOrders();
        });
    });

    // Load and optimize routes for active orders
    const activeOrders = Array.from(orderSystem.ordersMap.values())
        .filter(order => order.status === 'confirmed' || order.status === 'preparing');
    
    if (activeOrders.length > 0) {
        // Group orders by restaurant
        const ordersByRestaurant = activeOrders.reduce((acc, order) => {
            if (!acc[order.restaurantId]) {
                acc[order.restaurantId] = [];
            }
            acc[order.restaurantId].push(order);
            return acc;
        }, {});

        // Calculate optimal routes for each restaurant's orders
        Object.values(ordersByRestaurant).forEach(restaurantOrders => {
            orderSystem.calculateBatchDeliveryRoute(restaurantOrders);
        });
    }
});

// Load orders with efficient data structures
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    // Filter orders for current user
    const userOrders = orders.filter(order => order.userId === currentUser.id);
    
    // Clear existing data
    orderSystem.ordersMap.clear();
    userOrders.forEach(order => orderSystem.addOrder(order));
    
    displayOrders();
}

// Display orders using the Strategy Pattern
function displayOrders() {
    const filteredOrders = orderSystem.filterOrders(FilterStrategies[currentFilter]);
    
    if (filteredOrders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }

    ordersList.style.display = 'block';
    noOrders.style.display = 'none';

    // Sort orders by date using BST
    const sortedOrders = [];
    orderSystem.ordersByDate.inorderTraversal(data => {
        const order = orderSystem.getOrderById(data.value);
        if (FilterStrategies[currentFilter](order)) {
            sortedOrders.push(order);
        }
    });

    // Display orders in reverse chronological order
    ordersList.innerHTML = sortedOrders.reverse().map(order => `
        <div class="card mb-4 order-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">Order ${order.id}</h5>
                    <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>
                </div>
                
                <div class="order-info mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="text-muted mb-1">Order Date</p>
                            <p class="mb-3">${formatDate(order.orderDate)}</p>
                            <p class="text-muted mb-1">Delivery Address</p>
                            <p class="mb-0">${order.delivery.address}</p>
                            <p class="mb-0">${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted mb-1">Total Amount</p>
                            <p class="mb-3">$${order.total.toFixed(2)}</p>
                            <p class="text-muted mb-1">Items</p>
                            <p class="mb-0">${getTotalItems(order.items)} items from ${getUniqueRestaurants(order.items)} restaurant(s)</p>
                        </div>
                    </div>
                </div>

                <div class="order-progress mb-4">
                    <div class="progress-track">
                        <ul>
                            ${getProgressSteps(order.status)}
                        </ul>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye me-2"></i>View Details
                    </button>
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-primary" onclick="reorderItems('${order.id}')">
                            <i class="fas fa-redo me-2"></i>Reorder
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to generate order card HTML
function generateOrderCard(order) {
    const deliveryStatus = orderSystem.getOrderDeliveryStatus(order.id);
    const statusHtml = deliveryStatus ? `
        <div class="delivery-status">
            <h6>Delivery Status</h6>
            <p>Status: ${formatStatus(deliveryStatus.status)}</p>
            <p>ETA: ${deliveryStatus.estimatedTime} minutes</p>
            ${deliveryStatus.currentLocation ? `
                <p>Current Location: ${
                    orderSystem.routeOptimizer.locations.get(deliveryStatus.currentLocation).name
                }</p>
            ` : ''}
        </div>
    ` : '';

    return `
        <div class="card mb-4 order-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">Order ${order.id}</h5>
                    <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>
                </div>
                
                <div class="order-info mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="text-muted mb-1">Order Date</p>
                            <p class="mb-3">${formatDate(order.orderDate)}</p>
                            <p class="text-muted mb-1">Delivery Address</p>
                            <p class="mb-0">${order.delivery.address}</p>
                            <p class="mb-0">${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted mb-1">Total Amount</p>
                            <p class="mb-3">$${order.total.toFixed(2)}</p>
                            <p class="text-muted mb-1">Items</p>
                            <p class="mb-0">${getTotalItems(order.items)} items from ${getUniqueRestaurants(order.items)} restaurant(s)</p>
                        </div>
                    </div>
                </div>

                <div class="order-progress mb-4">
                    <div class="progress-track">
                        <ul>
                            ${getProgressSteps(order.status)}
                        </ul>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye me-2"></i>View Details
                    </button>
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-primary" onclick="reorderItems('${order.id}')">
                            <i class="fas fa-redo me-2"></i>Reorder
                        </button>
                    ` : ''}
                </div>

                ${statusHtml}
                    </div>
                </div>
            `;
}

// Helper functions with optimized implementations
function getStatusBadgeClass(status) {
    const statusMap = new Map([
        ['confirmed', 'bg-primary'],
        ['preparing', 'bg-warning text-dark'],
        ['on_the_way', 'bg-info'],
        ['delivered', 'bg-success'],
        ['cancelled', 'bg-danger']
    ]);
    return statusMap.get(status) || 'bg-secondary';
}

function formatStatus(status) {
    return status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Optimized item counting using reduce
function getTotalItems(items) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Optimized unique restaurant counting using Set
function getUniqueRestaurants(items) {
    return new Set(items.map(item => item.restaurantName)).size;
}

// Progress tracking with constant-time lookup
function getProgressSteps(status) {
    const steps = [
        { icon: 'check', text: 'Confirmed' },
        { icon: 'utensils', text: 'Preparing' },
        { icon: 'motorcycle', text: 'On the Way' },
        { icon: 'home', text: 'Delivered' }
    ];

    const statusIndex = steps.findIndex(step => 
        step.text.toLowerCase() === status.replace('_', ' ')
    );

    return steps.map((step, index) => `
        <li class="step ${index <= statusIndex ? 'active' : ''}">
            <span class="icon"><i class="fas fa-${step.icon}"></i></span>
            <span class="text">${step.text}</span>
        </li>
    `).join('');
}

// Event handlers
function viewOrderDetails(orderId) {
    window.location.href = `/order-confirmation.html?orderId=${orderId}`;
}

function reorderItems(orderId) {
    const order = orderSystem.getOrderById(orderId);
    if (!order) return;

    localStorage.setItem('cart', JSON.stringify(order.items));
    window.location.href = '/checkout.html';
}

// Auth UI update
function updateAuthUI() {
    loginBtn.innerHTML = currentUser ? 
        '<i class="fas fa-user me-1"></i>Logout' : 
        '<i class="fas fa-user me-1"></i>Login';
}

// Login button handler
loginBtn.addEventListener('click', () => {
    if (currentUser) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    } else {
        window.location.href = '/?redirect=orders';
    }
});

// Helper functions
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'info',
        'preparing': 'primary',
        'delivering': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

function formatAddress(address) {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
} 