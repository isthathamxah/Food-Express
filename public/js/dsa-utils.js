// Priority Queue for Order Processing
class OrderQueue {
    constructor() {
        this.values = [];
    }

    enqueue(order) {
        const priority = this.calculatePriority(order);
        this.values.push({ order, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }

    calculatePriority(order) {
        let priority = 0;
        
        // Priority based on order total
        if (order.total > 100) priority -= 2;
        if (order.total > 50) priority -= 1;

        // Priority based on payment method
        if (order.payment_method === 'card') priority -= 2;

        // Priority based on order size
        if (order.items.length > 5) priority -= 1;

        return priority;
    }

    getNextOrder() {
        return this.values[0]?.order || null;
    }
}

// LRU Cache for Recent Orders
class OrderCache {
    constructor(capacity = 10) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    put(orderId, orderData) {
        if (this.cache.has(orderId)) {
            this.cache.delete(orderId);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(orderId, orderData);
    }

    get(orderId) {
        if (!this.cache.has(orderId)) return null;
        const value = this.cache.get(orderId);
        this.cache.delete(orderId);
        this.cache.set(orderId, value);
        return value;
    }

    getRecentOrders() {
        return Array.from(this.cache.values()).reverse();
    }
}

// Trie for Menu Search
class MenuSearchTrie {
    constructor() {
        this.root = {};
    }

    insert(item) {
        let node = this.root;
        const words = item.name.toLowerCase().split(' ');
        
        words.forEach(word => {
            for (let i = 0; i < word.length; i++) {
                const prefix = word.slice(0, i + 1);
                if (!node[prefix]) {
                    node[prefix] = { items: [], next: {} };
                }
                if (!node[prefix].items.some(existing => existing.id === item.id)) {
                    node[prefix].items.push(item);
                }
                node = node[prefix].next;
            }
        });
    }

    search(query) {
        query = query.toLowerCase();
        let node = this.root;
        
        if (!query) return [];
        
        // Search by prefix
        if (node[query]) {
            return node[query].items;
        }
        
        // Search by words
        return Object.keys(this.root)
            .filter(key => key.includes(query))
            .reduce((acc, key) => {
                return [...acc, ...this.root[key].items];
            }, [])
            .filter((item, index, self) => 
                index === self.findIndex(t => t.id === item.id)
            )
            .slice(0, 5);
    }
}

// Initialize global instances
const orderQueue = new OrderQueue();
const orderCache = new OrderCache();
const menuSearch = new MenuSearchTrie();

// Export the instances
window.DSA = {
    orderQueue,
    orderCache,
    menuSearch
}; 