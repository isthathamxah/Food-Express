// State management
let currentUser = null;
let currentOrder = null;

// DOM Elements
const orderId = document.getElementById('orderId');
const estimatedTime = document.getElementById('estimatedTime');
const orderDetails = document.getElementById('orderDetails');
const progressSteps = document.getElementById('progressSteps');
const loginBtn = document.getElementById('loginBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    
    if (!orderId) {
        window.location.href = '/orders.html';
        return;
    }

    // Initialize route visualizer
    const routeVisualizer = new RouteVisualizer('deliveryMap');

    // Get DOM elements
    const orderDetails = document.querySelector('.order-details');
    const progressLine = document.getElementById('progressLine');
    const statusSteps = ['confirmed', 'preparing', 'delivering', 'delivered'];
    const estimatedTimeEl = document.getElementById('estimatedTime');
    const deliveryAddressEl = document.getElementById('deliveryAddress');
    const driverInfoEl = document.getElementById('driverInfo');

    // Update order status UI
    function updateOrderStatus(status) {
        const currentStepIndex = statusSteps.indexOf(status);
        
        // Update progress line
        const progress = (currentStepIndex / (statusSteps.length - 1)) * 100;
        progressLine.style.width = `${progress}%`;

        // Update step icons
        statusSteps.forEach((step, index) => {
            const stepIcon = document.getElementById(`${step}Step`);
            const stepLabel = stepIcon.nextElementSibling;

            if (index <= currentStepIndex) {
                stepIcon.classList.add('active');
                stepLabel.classList.add('active');
            } else {
                stepIcon.classList.remove('active');
                stepLabel.classList.remove('active');
            }
        });
    }

    // Load and display order details
    async function loadOrderDetails() {
        try {
            const order = await OrderService.getOrderDetails(orderId);
            
            // Display order details
            orderDetails.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Order #${order.orderNumber}</h5>
                        <div class="order-items mt-4">
                            <h6>Items</h6>
                            ${order.items.map(item => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <hr>
                        <div class="order-summary">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>$${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Delivery Fee</span>
                                <span>$${order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Tax</span>
                                <span>$${order.tax.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between fw-bold mt-2">
                                <span>Total</span>
                                <span>$${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Update delivery information
            deliveryAddressEl.textContent = `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}`;

            // Add locations to route optimizer
            window.AdvancedRouteOptimizer.addLocation(
                order.restaurantId,
                order.restaurantName,
                order.restaurant.latitude,
                order.restaurant.longitude
            );

            window.AdvancedRouteOptimizer.addLocation(
                `D${order.id}`,
                `Delivery for Order #${order.orderNumber}`,
                order.delivery.latitude,
                order.delivery.longitude
            );

            // Calculate and visualize route
            const route = window.AdvancedRouteOptimizer.calculateBatchDeliveryRoute([order]);
            routeVisualizer.visualizeMultiVehicleRoutes(new Map([[route.vehicleId, route]]));

            // Update status and ETA
            updateOrderStatus(order.status);
            if (route.estimatedTime) {
                estimatedTimeEl.textContent = `Estimated delivery in ${route.estimatedTime} minutes`;
            }

            // Start real-time updates
            startRealtimeUpdates(order.id, route.vehicleId);

        } catch (error) {
            console.error('Error loading order details:', error);
            alert('Failed to load order details. Please try again.');
        }
    }

    // Handle real-time updates
    function startRealtimeUpdates(orderId, vehicleId) {
        // Simulate real-time updates every 30 seconds
        const updateInterval = setInterval(() => {
            const updates = new Map();
            const currentLocation = getCurrentVehicleLocation(vehicleId);
            
            if (currentLocation) {
                const update = window.AdvancedRouteOptimizer.updateRouteStatus(
                    vehicleId,
                    'delivering',
                    currentLocation
                );
                updates.set(vehicleId, update);
                routeVisualizer.showRealTimeUpdates(updates);

                // Update driver info
                const driver = getDriverInfo(vehicleId);
                driverInfoEl.textContent = `${driver.name} (${driver.phone})`;

                // Check if order is delivered
                if (isOrderDelivered(orderId)) {
                    clearInterval(updateInterval);
                    updateOrderStatus('delivered');
                }
            }
        }, 30000);

        // Cleanup on page unload
        window.addEventListener('unload', () => {
            clearInterval(updateInterval);
        });
    }

    // Simulate getting current vehicle location
    function getCurrentVehicleLocation(vehicleId) {
        // In a real application, this would get the actual vehicle location
        // For demo purposes, we'll return a simulated location
        const vehicle = window.AdvancedRouteOptimizer.vehicles.get(vehicleId);
        if (!vehicle) return null;

        const route = vehicle.route;
        if (!route || route.length === 0) return null;

        // Simulate vehicle moving along the route
        const progress = (Date.now() % 60000) / 60000; // Complete route in 1 minute
        const currentStopIndex = Math.floor(progress * route.length);
        return route[Math.min(currentStopIndex, route.length - 1)];
    }

    // Simulate getting driver information
    function getDriverInfo(vehicleId) {
        // In a real application, this would get the actual driver info
        return {
            name: 'John Doe',
            phone: '(555) 123-4567'
        };
    }

    // Simulate checking if order is delivered
    function isOrderDelivered(orderId) {
        // In a real application, this would check the actual order status
        return false;
    }

    // Initialize page
    loadOrderDetails();
});

// Auth UI update
function updateAuthUI() {
    if (currentUser) {
        loginBtn.innerHTML = '<i class="fas fa-user me-1"></i>Logout';
        document.getElementById('ordersLink').style.display = 'block';
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user me-1"></i>Login';
        document.getElementById('ordersLink').style.display = 'none';
    }
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