// Priority Queue implementation for Order Processing
class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(order, priority) {
        this.values.push({ order, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
}

// Graph implementation for Restaurant-Delivery Routes
class DeliveryGraph {
    constructor() {
        this.adjacencyList = {};
        this.vertices = new Set();
    }

    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
            this.vertices.add(vertex);
        }
    }

    addEdge(vertex1, vertex2, weight) {
        this.adjacencyList[vertex1].push({ node: vertex2, weight });
        this.adjacencyList[vertex2].push({ node: vertex1, weight });
    }

    // Dijkstra's Algorithm for shortest delivery path
    findShortestPath(start, finish) {
        const nodes = new PriorityQueue();
        const distances = {};
        const previous = {};
        let path = []; // to return at end
        let smallest;

        // Build up initial state
        for (let vertex of this.vertices) {
            if (vertex === start) {
                distances[vertex] = 0;
                nodes.enqueue(vertex, 0);
            } else {
                distances[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
        }

        // As long as there is something to visit
        while (nodes.values.length) {
            smallest = nodes.dequeue().order;
            if (smallest === finish) {
                // We are done, build up path to return
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                break;
            }

            if (smallest || distances[smallest] !== Infinity) {
                for (let neighbor of this.adjacencyList[smallest]) {
                    // Calculate new distance to neighboring node
                    let candidate = distances[smallest] + neighbor.weight;
                    if (candidate < distances[neighbor.node]) {
                        // Updating new smallest distance to neighbor
                        distances[neighbor.node] = candidate;
                        // Updating previous - How we got to neighbor
                        previous[neighbor.node] = smallest;
                        // Enqueue in priority queue with new priority
                        nodes.enqueue(neighbor.node, candidate);
                    }
                }
            }
        }
        return path.concat(smallest).reverse();
    }
}

// Trie implementation for Search Suggestions
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.suggestions = [];
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, data = null) {
        let node = this.root;
        for (let char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
            if (data) {
                if (!node.suggestions.some(s => s.word === word)) {
                    node.suggestions.push({ word, data });
                }
                node.suggestions.sort((a, b) => b.data.frequency - a.data.frequency);
                node.suggestions = node.suggestions.slice(0, 5); // Keep top 5 suggestions
            }
        }
        node.isEndOfWord = true;
    }

    search(prefix) {
        let node = this.root;
        for (let char of prefix.toLowerCase()) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return node.suggestions;
    }
}

// LRU Cache implementation for frequently ordered items
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = { next: null, prev: null };
        this.tail = { next: null, prev: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    get(key) {
        if (this.cache.has(key)) {
            // Remove from current position
            const node = this.cache.get(key);
            this._removeNode(node);
            // Move to front
            this._addToFront(node);
            return node.value;
        }
        return null;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            // Remove from current position
            const node = this.cache.get(key);
            this._removeNode(node);
            node.value = value;
            // Move to front
            this._addToFront(node);
        } else {
            const newNode = { key, value, next: null, prev: null };
            this.cache.set(key, newNode);
            this._addToFront(newNode);
            
            if (this.cache.size > this.capacity) {
                // Remove from tail
                const tailNode = this.tail.prev;
                this._removeNode(tailNode);
                this.cache.delete(tailNode.key);
            }
        }
    }

    _removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }

    _addToFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
}

// Export all data structures
module.exports = {
    PriorityQueue,
    DeliveryGraph,
    Trie,
    LRUCache
}; 