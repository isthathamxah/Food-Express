const { PriorityQueue, DeliveryGraph, Trie, LRUCache } = require('../utils/data-structures');

class OrderProcessingService {
    constructor() {
        // Initialize data structures
        this.orderQueue = new PriorityQueue();
        this.deliveryGraph = new DeliveryGraph();
        this.searchTrie = new Trie();
        this.orderCache = new LRUCache(50); // Cache last 50 orders

        // Initialize delivery graph with some sample locations
        this.initializeDeliveryGraph();
    }

    // Initialize delivery graph with locations
    initializeDeliveryGraph() {
        const locations = ['Restaurant-A', 'Location-1', 'Location-2', 'Location-3', 'Location-4'];
        
        // Add vertices
        locations.forEach(location => this.deliveryGraph.addVertex(location));

        // Add edges with distances (in kilometers)
        this.deliveryGraph.addEdge('Restaurant-A', 'Location-1', 2);
        this.deliveryGraph.addEdge('Location-1', 'Location-2', 3);
        this.deliveryGraph.addEdge('Location-2', 'Location-3', 4);
        this.deliveryGraph.addEdge('Location-3', 'Location-4', 1);
        this.deliveryGraph.addEdge('Restaurant-A', 'Location-3', 7);
    }

    // Add a new order to the priority queue
    addOrder(order) {
        // Calculate priority based on various factors
        const priority = this.calculateOrderPriority(order);
        this.orderQueue.enqueue(order, priority);

        // Add to cache
        this.orderCache.put(order.id, order);

        // Add customer's frequently ordered items to search trie
        order.items.forEach(item => {
            this.searchTrie.insert(item.name, {
                id: item.id,
                frequency: 1,
                lastOrdered: new Date()
            });
        });

        return { orderId: order.id, estimatedTime: this.calculateDeliveryTime(order) };
    }

    // Calculate order priority (lower number = higher priority)
    calculateOrderPriority(order) {
        let priority = 0;
        
        // Priority based on order total
        if (order.total > 100) priority -= 2;
        if (order.total > 50) priority -= 1;

        // Priority based on customer status
        if (order.customer.isPremium) priority -= 3;

        // Priority based on order type
        if (order.isExpress) priority -= 5;

        return priority;
    }

    // Calculate estimated delivery time using graph
    calculateDeliveryTime(order) {
        const path = this.deliveryGraph.findShortestPath('Restaurant-A', order.deliveryLocation);
        const totalDistance = path.length - 1; // Simple estimation: each edge = 1 unit of time
        return totalDistance * 10; // 10 minutes per unit
    }

    // Get next order to process
    getNextOrder() {
        return this.orderQueue.dequeue();
    }

    // Search for menu items with suggestions
    searchMenuItems(prefix) {
        return this.searchTrie.search(prefix);
    }

    // Get order from cache
    getOrderFromCache(orderId) {
        return this.orderCache.get(orderId);
    }

    // Get optimal delivery route
    getDeliveryRoute(startLocation, endLocation) {
        return this.deliveryGraph.findShortestPath(startLocation, endLocation);
    }

    // Time Complexity Analysis:
    // - Adding an order: O(log n) due to priority queue operations
    // - Getting next order: O(1) with our implementation
    // - Searching menu items: O(m) where m is the length of the search prefix
    // - Finding shortest path: O((V + E) log V) using Dijkstra's algorithm
    // - Cache operations: O(1) for both get and put
    
    // Space Complexity Analysis:
    // - Priority Queue: O(n) where n is the number of orders
    // - Delivery Graph: O(V + E) where V is vertices and E is edges
    // - Trie: O(m * k) where m is total characters in all words and k is average word length
    // - LRU Cache: O(c) where c is the cache capacity
}

module.exports = OrderProcessingService; 