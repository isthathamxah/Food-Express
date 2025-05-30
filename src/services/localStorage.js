const { v4: uuidv4 } = require('uuid');
const { sampleRestaurants, sampleMenuItems } = require('../utils/sampleData');

// In-memory storage to mimic localStorage
const memoryStorage = new Map();

// localStorage polyfill for Node.js
const localStorage = {
    getItem: (key) => memoryStorage.get(key) || null,
    setItem: (key, value) => memoryStorage.set(key, value),
    removeItem: (key) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear()
};

// Initialize default data if not exists
const initializeStorage = () => {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('restaurants')) {
        localStorage.setItem('restaurants', JSON.stringify(sampleRestaurants));
    }
    if (!localStorage.getItem('menu_items')) {
        localStorage.setItem('menu_items', JSON.stringify(sampleMenuItems));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('cart_items')) {
        localStorage.setItem('cart_items', JSON.stringify([]));
    }
};

// Generic CRUD operations
const getAll = (collection) => {
    const data = localStorage.getItem(collection);
    return JSON.parse(data || '[]');
};

const getById = (collection, id) => {
    const items = getAll(collection);
    return items.find(item => item.id === id);
};

const create = (collection, item) => {
    const items = getAll(collection);
    const newItem = { ...item, id: uuidv4(), created_at: new Date().toISOString() };
    items.push(newItem);
    localStorage.setItem(collection, JSON.stringify(items));
    return newItem;
};

const update = (collection, id, updates) => {
    const items = getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(collection, JSON.stringify(items));
    return items[index];
};

const remove = (collection, id) => {
    const items = getAll(collection);
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(collection, JSON.stringify(filtered));
};

// Specific operations for different entities
const userService = {
    create: (userData) => create('users', userData),
    getByEmail: (email) => {
        const users = getAll('users');
        return users.find(user => user.email === email);
    },
    update: (id, updates) => update('users', id, updates),
    getById: (id) => getById('users', id)
};

const restaurantService = {
    getAll: () => getAll('restaurants'),
    getById: (id) => getById('restaurants', id),
    create: (data) => create('restaurants', data),
    update: (id, updates) => update('restaurants', id, updates),
    delete: (id) => remove('restaurants', id),
    search: (query) => {
        const restaurants = getAll('restaurants');
        return restaurants.filter(r => 
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.cuisine_type.toLowerCase().includes(query.toLowerCase())
        );
    }
};

const menuService = {
    getAllByRestaurant: (restaurantId) => {
        const items = getAll('menu_items');
        return items.filter(item => item.restaurant_id === restaurantId);
    },
    create: (data) => create('menu_items', data),
    update: (id, updates) => update('menu_items', id, updates),
    delete: (id) => remove('menu_items', id)
};

const cartService = {
    getByUser: (userId) => {
        const items = getAll('cart_items');
        return items.filter(item => item.user_id === userId);
    },
    addItem: (data) => create('cart_items', data),
    updateItem: (id, updates) => update('cart_items', id, updates),
    removeItem: (id) => remove('cart_items', id),
    clearCart: (userId) => {
        const items = getAll('cart_items');
        const filtered = items.filter(item => item.user_id !== userId);
        localStorage.setItem('cart_items', JSON.stringify(filtered));
    }
};

const orderService = {
    create: (orderData) => {
        const order = create('orders', orderData);
        // Clear cart after order creation
        cartService.clearCart(orderData.user_id);
        return order;
    },
    getByUser: (userId) => {
        const orders = getAll('orders');
        return orders.filter(order => order.user_id === userId);
    },
    getByRestaurant: (restaurantId) => {
        const orders = getAll('orders');
        return orders.filter(order => order.restaurant_id === restaurantId);
    },
    updateStatus: (id, status) => update('orders', id, { status })
};

module.exports = {
    initializeStorage,
    userService,
    restaurantService,
    menuService,
    cartService,
    orderService
}; 