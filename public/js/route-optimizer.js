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

class RouteOptimizer {
    constructor() {
        this.graph = new Map();
        this.locations = new Map();
        this.distances = new Map();
    }

    // Add a location to the graph
    // Time Complexity: O(1)
    addLocation(location) {
        if (!this.graph.has(location)) {
            this.graph.set(location, new Map());
        }
    }

    // Add a route between two locations with distance
    // Time Complexity: O(1)
    addRoute(location1, location2, distance) {
        this.addLocation(location1);
        this.addLocation(location2);
        this.graph.get(location1).set(location2, distance);
        this.graph.get(location2).set(location1, distance);

        // Store the distance for future reference
        const key = `${Math.min(location1, location2)}-${Math.max(location1, location2)}`;
        this.distances.set(key, distance);
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
    // Time Complexity: O((V + E) log V) where V is vertices and E is edges
    findShortestPath(start, end) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Initialize distances
        for (let location of this.graph.keys()) {
            distances.set(location, Infinity);
            previous.set(location, null);
            unvisited.add(location);
        }
        distances.set(start, 0);

        while (unvisited.size > 0) {
            // Find unvisited location with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (let location of unvisited) {
                if (distances.get(location) < minDistance) {
                    minDistance = distances.get(location);
                    current = location;
                }
            }

            if (current === end) break;
            if (current === null) break;

            unvisited.delete(current);

            // Update distances to neighbors
            for (let [neighbor, distance] of this.graph.get(current).entries()) {
                if (!unvisited.has(neighbor)) continue;
                
                let newDistance = distances.get(current) + distance;
                if (newDistance < distances.get(neighbor)) {
                    distances.set(neighbor, newDistance);
                    previous.set(neighbor, current);
                }
            }
        }

        // Build path
        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return {
            path,
            distance: distances.get(end)
        };
    }

    // Find optimal delivery route for multiple locations
    // Time Complexity: O(n! * (V + E) log V) where n is number of delivery locations
    findOptimalDeliveryRoute(start, deliveryLocations) {
        const allRoutes = this.permutations(deliveryLocations);
        let bestRoute = null;
        let shortestDistance = Infinity;

        for (let route of allRoutes) {
            let totalDistance = 0;
            let currentLocation = start;

            // Calculate total distance for this route
            for (let nextLocation of route) {
                const result = this.findShortestPath(currentLocation, nextLocation);
                totalDistance += result.distance;
                currentLocation = nextLocation;
            }

            // Add return to start
            const returnPath = this.findShortestPath(currentLocation, start);
            totalDistance += returnPath.distance;

            if (totalDistance < shortestDistance) {
                shortestDistance = totalDistance;
                bestRoute = [start, ...route, start];
            }
        }

        return {
            route: bestRoute,
            totalDistance: shortestDistance
        };
    }

    // Generate all possible permutations of delivery locations
    // Time Complexity: O(n!)
    permutations(arr) {
        if (arr.length <= 1) return [arr];
        
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const perms = this.permutations(remaining);
            
            for (let perm of perms) {
                result.push([current, ...perm]);
            }
        }
        
        return result;
    }

    // Calculate estimated delivery time based on distance
    // Time Complexity: O(1)
    calculateDeliveryTime(distance) {
        const averageSpeed = 30; // km/h
        const baseTime = 15; // minutes (preparation time)
        return baseTime + (distance / averageSpeed * 60);
    }

    // Get route information with location names and total distance
    getRouteInfo(path) {
        const routeInfo = {
            locations: path.map(id => ({
                id,
                ...this.locations.get(id)
            })),
            totalDistance: this.calculatePathDistance(path),
            estimatedTime: this.calculateEstimatedTime(path)
        };

        return routeInfo;
    }

    // Calculate estimated delivery time based on distance and traffic conditions
    calculateEstimatedTime(path) {
        const distance = this.calculatePathDistance(path);
        const averageSpeed = 30; // km/h
        const baseTime = (distance / averageSpeed) * 60; // Convert to minutes

        // Add time for each stop (pickup/delivery)
        const stopsTime = (path.length - 1) * 5; // 5 minutes per stop

        // Add traffic delay factor (simplified)
        const trafficDelay = this.getTrafficDelay();
        
        return Math.ceil(baseTime + stopsTime + trafficDelay);
    }

    // Get traffic delay based on time of day (simplified)
    getTrafficDelay() {
        const hour = new Date().getHours();
        
        // Peak hours: 8-10 AM and 5-7 PM
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
            return 15; // 15 minutes delay during peak hours
        }
        
        // Moderate traffic: 11 AM - 4 PM
        if (hour >= 11 && hour <= 16) {
            return 10; // 10 minutes delay during moderate traffic
        }
        
        // Low traffic: Early morning and late evening
        return 5; // 5 minutes delay during low traffic
    }

    // Calculate total distance of a path
    calculatePathDistance(path) {
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const key = `${Math.min(path[i], path[i+1])}-${Math.max(path[i], path[i+1])}`;
            totalDistance += this.distances.get(key);
        }
        return totalDistance;
    }
}

// Example usage:
const routeOptimizer = new RouteOptimizer();

// Add locations (id, name, latitude, longitude)
routeOptimizer.addLocation('R1', 'Restaurant A', 40.7128, -74.0060);
routeOptimizer.addLocation('R2', 'Restaurant B', 40.7589, -73.9851);
routeOptimizer.addLocation('D1', 'Customer 1', 40.7549, -73.9840);
routeOptimizer.addLocation('D2', 'Customer 2', 40.7489, -73.9680);

// Add routes with distances (in kilometers)
routeOptimizer.addRoute('R1', 'D1', 2.5);
routeOptimizer.addRoute('R1', 'D2', 3.0);
routeOptimizer.addRoute('R2', 'D1', 1.5);
routeOptimizer.addRoute('R2', 'D2', 2.0);
routeOptimizer.addRoute('D1', 'D2', 1.0);

// Export for use in other modules
window.RouteOptimizer = routeOptimizer; 