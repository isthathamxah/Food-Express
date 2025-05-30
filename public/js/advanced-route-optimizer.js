class AdvancedPriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority, fScore) {
        this.values.push({ val, priority, fScore });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        // Sort by fScore (A* heuristic) for better pathfinding
        this.values.sort((a, b) => a.fScore - b.fScore);
    }
}

class DeliveryVehicle {
    constructor(id, capacity, startLocation) {
        this.id = id;
        this.capacity = capacity;
        this.currentLocation = startLocation;
        this.route = [];
        this.timeWindows = [];
        this.totalDistance = 0;
        this.estimatedTime = 0;
        this.status = 'available';
    }
}

class AdvancedRouteOptimizer extends RouteOptimizer {
    constructor() {
        super();
        this.vehicles = new Map();
        this.trafficData = new Map();
        this.timeWindows = new Map();
        this.realTimeUpdates = new Map();
    }

    // A* Algorithm implementation for better pathfinding
    findShortestPathAStar(start, finish) {
        const nodes = new AdvancedPriorityQueue();
        const distances = {};
        const previous = {};
        const fScores = {};
        let path = [];
        let smallest;

        // Initialize data structures
        for (let vertex of this.adjacencyList.keys()) {
            if (vertex === start) {
                distances[vertex] = 0;
                fScores[vertex] = this.heuristic(vertex, finish);
                nodes.enqueue(vertex, 0, fScores[vertex]);
            } else {
                distances[vertex] = Infinity;
                fScores[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity, Infinity);
            }
            previous[vertex] = null;
        }

        while (nodes.values.length) {
            smallest = nodes.dequeue().val;
            if (smallest === finish) {
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                break;
            }

            if (smallest || distances[smallest] !== Infinity) {
                for (let neighbor of this.adjacencyList.get(smallest)) {
                    let candidate = distances[smallest] + this.getEdgeWeight(smallest, neighbor.node);
                    let nextNeighbor = neighbor.node;

                    if (candidate < distances[nextNeighbor]) {
                        distances[nextNeighbor] = candidate;
                        previous[nextNeighbor] = smallest;
                        fScores[nextNeighbor] = candidate + this.heuristic(nextNeighbor, finish);
                        nodes.enqueue(nextNeighbor, candidate, fScores[nextNeighbor]);
                    }
                }
            }
        }
        return path.concat(smallest).reverse();
    }

    // Heuristic function for A* (Manhattan distance)
    heuristic(node1, node2) {
        const loc1 = this.locations.get(node1);
        const loc2 = this.locations.get(node2);
        return Math.abs(loc1.latitude - loc2.latitude) + Math.abs(loc1.longitude - loc2.longitude);
    }

    // Get edge weight considering real-time traffic
    getEdgeWeight(from, to) {
        const key = `${Math.min(from, to)}-${Math.max(from, to)}`;
        const baseDistance = this.distances.get(key);
        const trafficMultiplier = this.getTrafficMultiplier(key);
        return baseDistance * trafficMultiplier;
    }

    // Add delivery vehicle
    addVehicle(id, capacity, startLocation) {
        const vehicle = new DeliveryVehicle(id, capacity, startLocation);
        this.vehicles.set(id, vehicle);
        return vehicle;
    }

    // Set time window for delivery
    setDeliveryTimeWindow(orderId, startTime, endTime) {
        this.timeWindows.set(orderId, { startTime, endTime });
    }

    // Update real-time traffic data
    updateTrafficData(locationKey, trafficLevel) {
        this.trafficData.set(locationKey, {
            level: trafficLevel,
            timestamp: new Date()
        });
    }

    // Get traffic multiplier based on real-time data
    getTrafficMultiplier(locationKey) {
        const trafficData = this.trafficData.get(locationKey);
        if (!trafficData) return 1;

        // Check if traffic data is recent (within last 15 minutes)
        const fifteenMinutes = 15 * 60 * 1000;
        if (new Date() - trafficData.timestamp > fifteenMinutes) {
            return 1;
        }

        switch (trafficData.level) {
            case 'heavy': return 2.0;
            case 'moderate': return 1.5;
            case 'light': return 1.2;
            default: return 1;
        }
    }

    // Calculate optimal routes for multiple vehicles
    calculateMultiVehicleRoutes(orders) {
        const unassignedOrders = [...orders];
        const vehicleRoutes = new Map();

        // Sort vehicles by capacity
        const sortedVehicles = Array.from(this.vehicles.values())
            .sort((a, b) => b.capacity - a.capacity);

        for (const vehicle of sortedVehicles) {
            if (unassignedOrders.length === 0) break;

            const vehicleOrders = this.assignOrdersToVehicle(
                vehicle,
                unassignedOrders
            );

            // Calculate optimal route for vehicle's orders
            const route = this.calculateVehicleRoute(vehicle, vehicleOrders);
            vehicleRoutes.set(vehicle.id, route);

            // Remove assigned orders
            vehicleOrders.forEach(order => {
                const index = unassignedOrders.indexOf(order);
                if (index > -1) unassignedOrders.splice(index, 1);
            });
        }

        return vehicleRoutes;
    }

    // Assign orders to a vehicle based on capacity and time windows
    assignOrdersToVehicle(vehicle, orders) {
        const assignedOrders = [];
        let remainingCapacity = vehicle.capacity;

        for (const order of orders) {
            if (remainingCapacity <= 0) break;

            const timeWindow = this.timeWindows.get(order.id);
            if (timeWindow) {
                // Check if delivery is possible within time window
                const estimatedArrival = this.estimateArrivalTime(
                    vehicle.currentLocation,
                    order.delivery.location,
                    vehicle.route
                );

                if (estimatedArrival <= timeWindow.endTime) {
                    assignedOrders.push(order);
                    remainingCapacity--;
                }
            } else {
                assignedOrders.push(order);
                remainingCapacity--;
            }
        }

        return assignedOrders;
    }

    // Calculate optimal route for a vehicle
    calculateVehicleRoute(vehicle, orders) {
        const route = {
            vehicleId: vehicle.id,
            stops: [],
            totalDistance: 0,
            estimatedTime: 0
        };

        let currentLocation = vehicle.currentLocation;

        // Sort orders by time windows if they exist
        const sortedOrders = this.sortOrdersByTimeWindows(orders);

        for (const order of sortedOrders) {
            const path = this.findShortestPathAStar(
                currentLocation,
                order.delivery.location
            );

            const stopInfo = {
                orderId: order.id,
                location: order.delivery.location,
                estimatedArrival: this.estimateArrivalTime(
                    currentLocation,
                    order.delivery.location,
                    route.stops
                ),
                path: path
            };

            route.stops.push(stopInfo);
            route.totalDistance += this.calculatePathDistance(path);
            currentLocation = order.delivery.location;
        }

        route.estimatedTime = this.calculateEstimatedTime(route.stops);
        return route;
    }

    // Sort orders by time windows
    sortOrdersByTimeWindows(orders) {
        return orders.sort((a, b) => {
            const timeWindowA = this.timeWindows.get(a.id);
            const timeWindowB = this.timeWindows.get(b.id);

            if (!timeWindowA && !timeWindowB) return 0;
            if (!timeWindowA) return 1;
            if (!timeWindowB) return -1;

            return timeWindowA.startTime - timeWindowB.startTime;
        });
    }

    // Estimate arrival time at a location
    estimateArrivalTime(fromLocation, toLocation, previousStops) {
        const baseTime = new Date();
        let totalTime = 0;

        // Add time for previous stops
        if (previousStops) {
            totalTime += previousStops.length * 5; // 5 minutes per stop
        }

        // Add travel time
        const path = this.findShortestPathAStar(fromLocation, toLocation);
        const distance = this.calculatePathDistance(path);
        const travelTime = this.calculateEstimatedTime([{ path }]);

        totalTime += travelTime;
        return new Date(baseTime.getTime() + totalTime * 60000); // Convert minutes to milliseconds
    }

    // Get real-time route updates
    getRealTimeUpdates(routeId) {
        return this.realTimeUpdates.get(routeId) || {
            status: 'unknown',
            lastUpdate: null,
            currentLocation: null,
            delays: []
        };
    }

    // Update real-time route status
    updateRouteStatus(routeId, status, currentLocation, delay = 0) {
        const update = {
            status,
            lastUpdate: new Date(),
            currentLocation,
            delays: []
        };

        if (delay > 0) {
            update.delays.push({
                timestamp: new Date(),
                minutes: delay
            });
        }

        this.realTimeUpdates.set(routeId, update);
        return update;
    }
}

// Initialize advanced route optimizer
const advancedRouteOptimizer = new AdvancedRouteOptimizer();

// Add example vehicles
advancedRouteOptimizer.addVehicle('V1', 5, 'R1'); // Vehicle with capacity of 5 orders
advancedRouteOptimizer.addVehicle('V2', 3, 'R2'); // Vehicle with capacity of 3 orders

// Export for use in other modules
window.AdvancedRouteOptimizer = advancedRouteOptimizer; 