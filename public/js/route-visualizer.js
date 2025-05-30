class RouteVisualizer {
    constructor(mapContainerId) {
        this.map = null;
        this.markers = new Map();
        this.routes = new Map();
        this.vehicles = new Map();
        this.containerId = mapContainerId;
        this.initializeMap();
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map(this.containerId).setView([40.7128, -74.0060], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    // Add location marker to the map
    addMarker(id, latitude, longitude, type = 'location') {
        const markerOptions = this.getMarkerOptions(type);
        const marker = L.marker([latitude, longitude], markerOptions);
        
        // Add popup with location info
        marker.bindPopup(this.createPopupContent(id, type));
        
        marker.addTo(this.map);
        this.markers.set(id, marker);
    }

    // Get marker options based on type
    getMarkerOptions(type) {
        const iconOptions = {
            restaurant: {
                icon: 'utensils',
                color: '#e21b70',
                prefix: 'fa'
            },
            customer: {
                icon: 'user',
                color: '#3388ff',
                prefix: 'fa'
            },
            vehicle: {
                icon: 'truck',
                color: '#33ff33',
                prefix: 'fa'
            }
        };

        const options = iconOptions[type] || iconOptions.location;

        return {
            icon: L.divIcon({
                html: `<i class="${options.prefix} fa-${options.icon}" style="color: ${options.color}; font-size: 24px;"></i>`,
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        };
    }

    // Create popup content
    createPopupContent(id, type) {
        const location = window.AdvancedRouteOptimizer.locations.get(id);
        if (!location) return id;

        return `
            <div class="map-popup">
                <h4>${location.name}</h4>
                <p>Type: ${type}</p>
                ${type === 'vehicle' ? `
                    <p>Status: ${this.vehicles.get(id)?.status || 'Unknown'}</p>
                    <p>Orders: ${this.vehicles.get(id)?.orders?.length || 0}</p>
                ` : ''}
            </div>
        `;
    }

    // Draw route on the map
    drawRoute(routeId, path, options = {}) {
        const coordinates = path.map(locationId => {
            const location = window.AdvancedRouteOptimizer.locations.get(locationId);
            return [location.latitude, location.longitude];
        });

        const routeOptions = {
            color: options.color || '#3388ff',
            weight: options.weight || 3,
            opacity: options.opacity || 0.6,
            ...options
        };

        const polyline = L.polyline(coordinates, routeOptions);
        polyline.addTo(this.map);
        this.routes.set(routeId, polyline);

        // Fit map bounds to show entire route
        this.map.fitBounds(polyline.getBounds());
    }

    // Update vehicle position
    updateVehiclePosition(vehicleId, latitude, longitude, heading) {
        const marker = this.markers.get(vehicleId);
        if (marker) {
            marker.setLatLng([latitude, longitude]);
            
            // Update vehicle marker rotation if heading is provided
            if (heading !== undefined) {
                const icon = marker.getIcon();
                icon.options.html = `<i class="fa fa-truck" style="color: #33ff33; font-size: 24px; transform: rotate(${heading}deg);"></i>`;
                marker.setIcon(icon);
            }
        }
    }

    // Visualize multiple vehicle routes
    visualizeMultiVehicleRoutes(vehicleRoutes) {
        // Clear existing routes
        this.clearRoutes();

        // Color palette for different vehicles
        const colors = ['#3388ff', '#ff3333', '#33ff33', '#ff33ff', '#ffff33'];
        let colorIndex = 0;

        for (const [vehicleId, route] of vehicleRoutes) {
            const color = colors[colorIndex % colors.length];
            
            // Draw vehicle's route
            this.drawRoute(vehicleId, route.stops.map(stop => stop.location), {
                color,
                weight: 3,
                opacity: 0.6
            });

            // Add markers for each stop
            route.stops.forEach((stop, index) => {
                this.addMarker(
                    stop.location,
                    window.AdvancedRouteOptimizer.locations.get(stop.location).latitude,
                    window.AdvancedRouteOptimizer.locations.get(stop.location).longitude,
                    index === 0 ? 'restaurant' : 'customer'
                );
            });

            // Add vehicle marker at start position
            const startLocation = window.AdvancedRouteOptimizer.locations.get(route.stops[0].location);
            this.addMarker(
                vehicleId,
                startLocation.latitude,
                startLocation.longitude,
                'vehicle'
            );

            colorIndex++;
        }
    }

    // Show real-time updates
    showRealTimeUpdates(updates) {
        for (const [vehicleId, update] of updates) {
            // Update vehicle marker
            if (update.currentLocation) {
                const location = window.AdvancedRouteOptimizer.locations.get(update.currentLocation);
                this.updateVehiclePosition(
                    vehicleId,
                    location.latitude,
                    location.longitude
                );
            }

            // Update vehicle info
            this.vehicles.set(vehicleId, {
                status: update.status,
                orders: update.orders,
                lastUpdate: update.lastUpdate
            });

            // Update popup content
            const marker = this.markers.get(vehicleId);
            if (marker) {
                marker.getPopup().setContent(this.createPopupContent(vehicleId, 'vehicle'));
            }

            // Show delay notification if any
            if (update.delays && update.delays.length > 0) {
                this.showDelayNotification(vehicleId, update.delays[update.delays.length - 1]);
            }
        }
    }

    // Show delay notification
    showDelayNotification(vehicleId, delay) {
        const notification = document.createElement('div');
        notification.className = 'delay-notification';
        notification.innerHTML = `
            <strong>Delivery Delay</strong>
            <p>Vehicle ${vehicleId} is delayed by ${delay.minutes} minutes</p>
            <p>Reason: ${delay.reason || 'Traffic'}</p>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Clear all routes from the map
    clearRoutes() {
        for (const route of this.routes.values()) {
            route.remove();
        }
        this.routes.clear();
    }

    // Clear all markers from the map
    clearMarkers() {
        for (const marker of this.markers.values()) {
            marker.remove();
        }
        this.markers.clear();
    }

    // Reset the map view
    reset() {
        this.clearRoutes();
        this.clearMarkers();
        this.vehicles.clear();
    }
}

// Export for use in other modules
window.RouteVisualizer = RouteVisualizer; 