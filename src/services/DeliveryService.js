class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
}

class DeliveryService {
    constructor() {
        this.locations = new Map(); // Stores location details
        this.graph = new Map();     // Stores the adjacency list for Dijkstra's algorithm
        this.activeDeliveries = new Map(); // Tracks ongoing deliveries
        this.deliveryHistory = new Map(); // Stores delivery history
    }

    // Add a new location (restaurant or delivery point)
    addLocation(id, name, latitude, longitude, type = 'delivery') {
        this.locations.set(id, {
            id,
            name,
            latitude,
            longitude,
            type
        });

        // Initialize the adjacency list for this location
        if (!this.graph.has(id)) {
            this.graph.set(id, new Map());
        }
    }

    // Add a route between two locations with distance
    addRoute(location1, location2, distance) {
        // Add bidirectional route
        this.graph.get(location1).set(location2, distance);
        this.graph.get(location2).set(location1, distance);
    }

    // Calculate distance between two coordinates using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    // Find shortest path using Dijkstra's Algorithm
    findShortestPath(start, end) {
        const distances = new Map();
        const previous = new Map();
        const nodes = new PriorityQueue();
        const path = []; // To store final path

        // Initialize all distances to infinity except start
        for (let vertex of this.graph.keys()) {
            if (vertex === start) {
                distances.set(vertex, 0);
                nodes.enqueue(vertex, 0);
            } else {
                distances.set(vertex, Infinity);
                nodes.enqueue(vertex, Infinity);
            }
            previous.set(vertex, null);
        }

        // Main algorithm
        while (nodes.values.length) {
            let smallest = nodes.dequeue().val;
            if (smallest === end) {
                // Build path
                while (previous.get(smallest)) {
                    path.push(smallest);
                    smallest = previous.get(smallest);
                }
                path.push(start);
                break;
            }

            if (!smallest || distances.get(smallest) === Infinity) continue;

            for (let [neighbor, distance] of this.graph.get(smallest)) {
                let candidate = distances.get(smallest) + distance;
                if (candidate < distances.get(neighbor)) {
                    distances.set(neighbor, candidate);
                    previous.set(neighbor, smallest);
                    nodes.enqueue(neighbor, candidate);
                }
            }
        }

        return {
            path: path.reverse(),
            distance: distances.get(end),
            estimatedTime: this.calculateEstimatedTime(distances.get(end))
        };
    }

    // Calculate optimal route for multiple deliveries
    calculateOptimalRoute(startLocation, deliveryPoints) {
        let currentLocation = startLocation;
        const route = [startLocation];
        const unvisited = new Set(deliveryPoints);
        let totalDistance = 0;

        while (unvisited.size > 0) {
            let shortestDistance = Infinity;
            let nextLocation = null;
            let shortestPath = null;

            // Find the nearest unvisited delivery point
            for (let point of unvisited) {
                const result = this.findShortestPath(currentLocation, point);
                if (result.distance < shortestDistance) {
                    shortestDistance = result.distance;
                    nextLocation = point;
                    shortestPath = result.path;
                }
            }

            // Add the path to the route
            route.push(...shortestPath.slice(1));
            totalDistance += shortestDistance;
            unvisited.delete(nextLocation);
            currentLocation = nextLocation;
        }

        // Add return path to start location
        const returnPath = this.findShortestPath(currentLocation, startLocation);
        route.push(...returnPath.path.slice(1));
        totalDistance += returnPath.distance;

        return {
            route,
            totalDistance,
            estimatedTime: this.calculateEstimatedTime(totalDistance)
        };
    }

    // Calculate estimated delivery time based on distance
    calculateEstimatedTime(distance) {
        const averageSpeed = 30; // km/h
        const baseTime = 15; // minutes (preparation time)
        return Math.ceil(baseTime + (distance / averageSpeed * 60)); // Return time in minutes
    }

    // Start a new delivery
    startDelivery(orderId, restaurantId, deliveryLocation) {
        const route = this.findShortestPath(restaurantId, deliveryLocation);
        const deliveryId = `DEL-${orderId}`;
        
        this.activeDeliveries.set(deliveryId, {
            orderId,
            restaurantId,
            deliveryLocation,
            route: route.path,
            startTime: new Date(),
            estimatedTime: route.estimatedTime,
            status: 'in-progress',
            currentLocation: restaurantId,
            distanceRemaining: route.distance
        });

        return {
            deliveryId,
            ...route
        };
    }

    // Update delivery status
    updateDeliveryStatus(deliveryId, newLocation, status) {
        if (!this.activeDeliveries.has(deliveryId)) {
            throw new Error('Delivery not found');
        }

        const delivery = this.activeDeliveries.get(deliveryId);
        delivery.currentLocation = newLocation;
        delivery.status = status;

        if (status === 'completed') {
            this.deliveryHistory.set(deliveryId, {
                ...delivery,
                completionTime: new Date()
            });
            this.activeDeliveries.delete(deliveryId);
        }

        return delivery;
    }

    // Get delivery status
    getDeliveryStatus(deliveryId) {
        if (this.activeDeliveries.has(deliveryId)) {
            return this.activeDeliveries.get(deliveryId);
        }
        if (this.deliveryHistory.has(deliveryId)) {
            return this.deliveryHistory.get(deliveryId);
        }
        return null;
    }
}

module.exports = new DeliveryService(); 