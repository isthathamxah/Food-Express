// Test file for delivery routing functionality
console.log('Starting delivery routing tests...');

// Initialize route optimizer
const routeOptimizer = new RouteOptimizer();

// Test 1: Adding locations
console.log('\nTest 1: Adding locations');
routeOptimizer.addLocation('R1', 'Restaurant A', 40.7128, -74.0060);
routeOptimizer.addLocation('D1', 'Customer 1', 40.7589, -73.9851);
routeOptimizer.addLocation('D2', 'Customer 2', 40.7549, -73.9840);
routeOptimizer.addLocation('D3', 'Customer 3', 40.7489, -73.9680);
console.log('✓ Locations added successfully');

// Test 2: Adding routes
console.log('\nTest 2: Adding routes');
routeOptimizer.addRoute('R1', 'D1', 2.5);
routeOptimizer.addRoute('R1', 'D2', 3.0);
routeOptimizer.addRoute('R1', 'D3', 3.5);
routeOptimizer.addRoute('D1', 'D2', 1.0);
routeOptimizer.addRoute('D2', 'D3', 1.5);
routeOptimizer.addRoute('D1', 'D3', 2.0);
console.log('✓ Routes added successfully');

// Test 3: Finding shortest path
console.log('\nTest 3: Testing shortest path (Dijkstra\'s)');
const shortestPath = routeOptimizer.findShortestPath('R1', 'D3');
console.log('Shortest path:', shortestPath);

// Test 4: Calculate optimal delivery route
console.log('\nTest 4: Testing optimal delivery route');
const deliveryLocations = ['D1', 'D2', 'D3'];
const optimalRoute = routeOptimizer.findOptimalDeliveryRoute('R1', deliveryLocations);
console.log('Optimal route:', optimalRoute);

// Test 5: Calculate delivery time
console.log('\nTest 5: Testing delivery time calculation');
const deliveryTime = routeOptimizer.calculateDeliveryTime(optimalRoute.totalDistance);
console.log('Estimated delivery time:', deliveryTime, 'minutes');

// Test 6: Test route information
console.log('\nTest 6: Testing route information');
const routeInfo = routeOptimizer.getRouteInfo(optimalRoute.route);
console.log('Route information:', routeInfo);

// Test advanced features
console.log('\nTesting Advanced Features...');

// Test 7: Initialize advanced route optimizer
console.log('\nTest 7: Testing advanced route optimizer');
const advancedOptimizer = new AdvancedRouteOptimizer();

// Add same locations to advanced optimizer
advancedOptimizer.addLocation('R1', 'Restaurant A', 40.7128, -74.0060);
advancedOptimizer.addLocation('D1', 'Customer 1', 40.7589, -73.9851);
advancedOptimizer.addLocation('D2', 'Customer 2', 40.7549, -73.9840);
advancedOptimizer.addLocation('D3', 'Customer 3', 40.7489, -73.9680);

// Add routes
advancedOptimizer.addRoute('R1', 'D1', 2.5);
advancedOptimizer.addRoute('R1', 'D2', 3.0);
advancedOptimizer.addRoute('R1', 'D3', 3.5);
advancedOptimizer.addRoute('D1', 'D2', 1.0);
advancedOptimizer.addRoute('D2', 'D3', 1.5);
advancedOptimizer.addRoute('D1', 'D3', 2.0);

// Add vehicles
advancedOptimizer.addVehicle('V1', 2, 'R1');
advancedOptimizer.addVehicle('V2', 3, 'R1');

// Test 8: Set delivery time windows
console.log('\nTest 8: Testing time windows');
const now = new Date();
const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
advancedOptimizer.setDeliveryTimeWindow('D1', now, later);

// Create test orders
const testOrders = [
    { id: 'D1', delivery: { location: 'D1' } },
    { id: 'D2', delivery: { location: 'D2' } },
    { id: 'D3', delivery: { location: 'D3' } }
];

// Test 9: Calculate multi-vehicle routes
console.log('\nTest 9: Testing multi-vehicle routing');
const vehicleRoutes = advancedOptimizer.calculateMultiVehicleRoutes(testOrders);
console.log('Vehicle routes:', vehicleRoutes);

console.log('\nAll tests completed!'); 