// Priority Queue Implementation
class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(order, priority) {
        this.values.push({ order, priority });
        this.sort();
        this.updateUI();
    }

    dequeue() {
        const item = this.values.shift();
        this.updateUI();
        return item;
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }

    updateUI() {
        const container = document.getElementById('priorityQueue');
        container.innerHTML = this.values.map(item => `
            <div class="queue-item ${this.getPriorityClass(item.priority)}">
                <div class="d-flex justify-content-between">
                    <strong>Order #${item.order.id}</strong>
                    <span>Priority: ${item.priority}</span>
                </div>
                <div>Total: $${item.order.total}</div>
                <div class="text-muted">Status: ${item.order.status}</div>
            </div>
        `).join('');
    }

    getPriorityClass(priority) {
        if (priority <= -3) return 'high-priority';
        if (priority <= -1) return 'medium-priority';
        return 'low-priority';
    }
}

// Graph Implementation
class DeliveryGraph {
    constructor() {
        this.nodes = [
            { id: 'R-A', label: 'Restaurant A', x: 150, y: 150 },
            { id: 'L1', label: 'Location 1', x: 50, y: 50 },
            { id: 'L2', label: 'Location 2', x: 250, y: 50 },
            { id: 'L3', label: 'Location 3', x: 50, y: 250 },
            { id: 'L4', label: 'Location 4', x: 250, y: 250 }
        ];
        this.edges = [
            { from: 'R-A', to: 'L1', weight: 2 },
            { from: 'L1', to: 'L2', weight: 3 },
            { from: 'L2', to: 'L3', weight: 4 },
            { from: 'L3', to: 'L4', weight: 1 },
            { from: 'R-A', to: 'L3', weight: 7 }
        ];
        this.drawGraph();
    }

    drawGraph() {
        const container = document.getElementById('deliveryGraph');
        container.innerHTML = '';

        // Draw edges
        this.edges.forEach(edge => {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy);

            const edgeElement = document.createElement('div');
            edgeElement.className = 'edge';
            edgeElement.style.width = `${length}px`;
            edgeElement.style.left = `${fromNode.x}px`;
            edgeElement.style.top = `${fromNode.y}px`;
            edgeElement.style.transform = `rotate(${angle}deg)`;
            
            const weightLabel = document.createElement('div');
            weightLabel.style.position = 'absolute';
            weightLabel.style.left = `${fromNode.x + dx/2}px`;
            weightLabel.style.top = `${fromNode.y + dy/2}px`;
            weightLabel.textContent = edge.weight + 'km';

            container.appendChild(edgeElement);
            container.appendChild(weightLabel);
        });

        // Draw nodes
        this.nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            nodeElement.style.left = `${node.x - 30}px`;
            nodeElement.style.top = `${node.y - 30}px`;
            nodeElement.textContent = node.label;
            container.appendChild(nodeElement);
        });
    }

    highlightPath(path) {
        // Reset all nodes and edges
        document.querySelectorAll('.node').forEach(node => {
            node.style.background = '#007bff';
        });
        document.querySelectorAll('.edge').forEach(edge => {
            edge.style.background = '#333';
        });

        // Highlight the path
        for (let i = 0; i < path.length - 1; i++) {
            const fromNode = path[i];
            const toNode = path[i + 1];
            
            // Highlight nodes
            document.querySelectorAll('.node').forEach(node => {
                if (node.textContent === fromNode || node.textContent === toNode) {
                    node.style.background = '#28a745';
                }
            });

            // Highlight edge
            const edge = this.edges.find(e => 
                (e.from === fromNode && e.to === toNode) ||
                (e.from === toNode && e.to === fromNode)
            );
            if (edge) {
                const edgeElements = document.querySelectorAll('.edge');
                edgeElements.forEach(el => {
                    const fromNodePos = this.nodes.find(n => n.id === edge.from);
                    const elLeft = parseInt(el.style.left);
                    const elTop = parseInt(el.style.top);
                    if (Math.abs(elLeft - fromNodePos.x) < 5 && Math.abs(elTop - fromNodePos.y) < 5) {
                        el.style.background = '#28a745';
                    }
                });
            }
        }
    }
}

// Trie Implementation for Search
class TrieSearch {
    constructor() {
        this.menuItems = [
            'Pizza Margherita', 'Pepperoni Pizza', 'Pasta Carbonara',
            'Chicken Burger', 'Beef Burger', 'Caesar Salad',
            'French Fries', 'Fish and Chips', 'Ice Cream',
            'Chocolate Cake', 'Coffee', 'Coke'
        ];
    }

    search(prefix) {
        const results = this.menuItems.filter(item => 
            item.toLowerCase().includes(prefix.toLowerCase())
        );
        this.updateUI(results);
    }

    updateUI(results) {
        const container = document.getElementById('searchResults');
        container.innerHTML = results.map(item => `
            <div class="trie-node">
                <i class="fas fa-utensils me-2"></i>
                ${item}
            </div>
        `).join('');
    }
}

// LRU Cache Implementation
class LRUCache {
    constructor(capacity = 5) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
        this.updateUI();
    }

    updateUI() {
        const container = document.getElementById('lruCache');
        container.innerHTML = Array.from(this.cache.entries()).reverse().map(([key, value], index) => `
            <div class="cache-item ${index === 0 ? 'most-recent' : ''}">
                <div>
                    <strong>Order #${key}</strong>
                    <div>Total: $${value.total}</div>
                </div>
                <div class="text-muted">
                    ${index === 0 ? 'Most Recent' : `Position ${index + 1}`}
                </div>
            </div>
        `).join('');
    }
}

// Initialize all data structures
const priorityQueue = new PriorityQueue();
const deliveryGraph = new DeliveryGraph();
const trieSearch = new TrieSearch();
const lruCache = new LRUCache(5);

// Helper function to generate random orders
function generateRandomOrder() {
    const id = Math.floor(Math.random() * 1000);
    const total = Math.floor(Math.random() * 200) + 20;
    const status = ['pending', 'processing', 'delivered'][Math.floor(Math.random() * 3)];
    return { id, total, status };
}

// UI Event Handlers
function addRandomOrder() {
    const order = generateRandomOrder();
    const priority = -Math.floor(Math.random() * 5);
    priorityQueue.enqueue(order, priority);
}

function findRandomPath() {
    const locations = ['R-A', 'L1', 'L2', 'L3', 'L4'];
    const start = locations[Math.floor(Math.random() * locations.length)];
    const end = locations[Math.floor(Math.random() * locations.length)];
    deliveryGraph.highlightPath([start, end]);
}

function searchMenu(prefix) {
    trieSearch.search(prefix);
}

function addRandomCacheItem() {
    const order = generateRandomOrder();
    lruCache.put(order.id, order);
}

// Initialize with some data
window.onload = function() {
    // Add some initial orders
    addRandomOrder();
    addRandomOrder();
    addRandomOrder();

    // Add some initial cache items
    addRandomCacheItem();
    addRandomCacheItem();
    addRandomCacheItem();
}; 