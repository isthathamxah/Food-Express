// Delivery Tracking Module
const DeliveryTracking = {
    activeDeliveries: new Map(),
    
    init() {
        this.activeDeliveriesContainer = document.getElementById('activeDeliveries');
        this.deliveryInfoContainer = document.getElementById('deliveryInfo');
        this.trackOrderForm = document.getElementById('trackOrderForm');
        this.trackingResult = document.getElementById('trackingResult');
        this.setupEventListeners();
        this.loadActiveDeliveries();
    },

    setupEventListeners() {
        // Update delivery status every 30 seconds
        setInterval(() => this.updateDeliveryStatuses(), 30000);

        // Track order form submission
        this.trackOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const orderId = document.getElementById('orderIdInput').value.trim();
            if (orderId) {
                this.trackOrder(orderId);
            }
        });
    },

    async trackOrder(orderId) {
        try {
            this.showTrackingLoader();
            const response = await fetch(`/api/delivery/track/${orderId}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.showTrackingResult(data.data);
                // If the order is active, add it to active deliveries
                if (data.data.status !== 'completed' && data.data.status !== 'cancelled') {
                    this.activeDeliveries.set(data.data.deliveryId, data.data);
                    this.renderActiveDeliveries();
                }
            } else {
                this.showTrackingError('Order not found or tracking unavailable');
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            this.showTrackingError('Error tracking order. Please try again.');
        }
    },

    showTrackingLoader() {
        this.trackingResult.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Tracking your order...</p>
            </div>
        `;
    },

    showTrackingResult(delivery) {
        const statusClass = this.getStatusClass(delivery.status);
        const progress = this.calculateProgress(delivery);
        
        this.trackingResult.innerHTML = `
            <div class="tracking-details">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">Order #${delivery.orderId}</h5>
                    <span class="badge ${statusClass}">${delivery.status}</span>
                </div>
                <div class="progress mb-3" style="height: 10px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${progress}%" 
                         aria-valuenow="${progress}" 
                         aria-valuemin="0" 
                         aria-valuemax="100"></div>
                </div>
                <div class="delivery-info">
                    <p><strong>From:</strong> ${this.getLocationName(delivery.restaurantId)}</p>
                    <p><strong>To:</strong> ${this.getLocationName(delivery.deliveryLocation)}</p>
                    <p><strong>Estimated Time:</strong> ${delivery.estimatedTime} minutes</p>
                    <p><strong>Current Location:</strong> ${this.getLocationName(delivery.currentLocation)}</p>
                </div>
                <div class="route-info mt-3">
                    <h6>Delivery Route</h6>
                    <p>${delivery.route.path.map(loc => this.getLocationName(loc)).join(' → ')}</p>
                    <p><strong>Total Distance:</strong> ${delivery.route.distance.toFixed(1)} km</p>
                </div>
            </div>
        `;
    },

    showTrackingError(message) {
        this.trackingResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
        `;
    },

    async loadActiveDeliveries() {
        try {
            const response = await fetch('/api/delivery/active');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.activeDeliveries.clear();
                data.data.forEach(delivery => {
                    this.activeDeliveries.set(delivery.deliveryId, delivery);
                });
                this.renderActiveDeliveries();
            }
        } catch (error) {
            console.error('Error loading active deliveries:', error);
        }
    },

    async updateDeliveryStatuses() {
        for (const [deliveryId, delivery] of this.activeDeliveries) {
            try {
                const response = await fetch(`/api/delivery/status/${deliveryId}`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.activeDeliveries.set(deliveryId, data.data);
                }
            } catch (error) {
                console.error(`Error updating delivery ${deliveryId}:`, error);
            }
        }
        this.renderActiveDeliveries();
    },

    renderActiveDeliveries() {
        if (this.activeDeliveries.size === 0) {
            this.activeDeliveriesContainer.innerHTML = `
                <div class="text-center text-muted">
                    <p>No active deliveries</p>
                </div>
            `;
            return;
        }

        const deliveriesHTML = Array.from(this.activeDeliveries.values())
            .map(delivery => this.createDeliveryCard(delivery))
            .join('');

        this.activeDeliveriesContainer.innerHTML = deliveriesHTML;

        // Add click event listeners to the delivery cards
        document.querySelectorAll('.delivery-card').forEach(card => {
            card.addEventListener('click', () => {
                const deliveryId = card.dataset.deliveryId;
                const delivery = this.activeDeliveries.get(deliveryId);
                this.showDeliveryDetails(delivery);
            });
        });
    },

    createDeliveryCard(delivery) {
        const statusClass = this.getStatusClass(delivery.status);
        return `
            <div class="card mb-3 delivery-card" data-delivery-id="${delivery.deliveryId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="card-title mb-0">Order #${delivery.orderId}</h6>
                        <span class="badge ${statusClass}">${delivery.status}</span>
                    </div>
                    <p class="card-text mt-2 mb-1">
                        <small>From: ${this.getLocationName(delivery.restaurantId)}</small>
                    </p>
                    <p class="card-text mb-1">
                        <small>Estimated Time: ${delivery.estimatedTime} mins</small>
                    </p>
                    <div class="progress mt-2" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${this.calculateProgress(delivery)}%"></div>
                    </div>
                </div>
            </div>
        `;
    },

    showDeliveryDetails(delivery) {
        const route = delivery.route;
        this.deliveryInfoContainer.innerHTML = `
            <h6>Delivery Details</h6>
            <p><strong>Order ID:</strong> ${delivery.orderId}</p>
            <p><strong>Status:</strong> ${delivery.status}</p>
            <p><strong>Estimated Time:</strong> ${delivery.estimatedTime} minutes</p>
            <p><strong>Current Location:</strong> ${this.getLocationName(delivery.currentLocation)}</p>
            <div class="route-info mt-3">
                <h6>Delivery Route</h6>
                <p>${route.path.map(loc => this.getLocationName(loc)).join(' → ')}</p>
                <p><strong>Total Distance:</strong> ${route.distance.toFixed(1)} km</p>
            </div>
        `;
    },

    getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-warning',
            'in-progress': 'bg-primary',
            'completed': 'bg-success',
            'cancelled': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    },

    calculateProgress(delivery) {
        const totalTime = delivery.estimatedTime;
        const elapsed = (new Date() - new Date(delivery.startTime)) / (1000 * 60); // minutes
        return Math.min(Math.round((elapsed / totalTime) * 100), 100);
    },

    getLocationName(locationId) {
        // This should be replaced with actual location names from your database
        const locations = {
            'R1': 'Restaurant A',
            'R2': 'Restaurant B',
            'D1': 'Delivery Point 1',
            'D2': 'Delivery Point 2'
        };
        return locations[locationId] || locationId;
    }
};

// Initialize delivery tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    DeliveryTracking.init();
}); 