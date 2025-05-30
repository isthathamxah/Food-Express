-- Create and use database
CREATE DATABASE IF NOT EXISTS food_express;
USE food_express;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'restaurant_owner', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    image_url VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    preparation_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    delivery_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Reset auto-increment counters and clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE menu_items;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users
INSERT INTO users (name, email, password, role) VALUES
('John Admin', 'admin@foodexpress.com', 'password123', 'admin'),
('Mike Owner', 'owner@restaurant.com', 'password123', 'restaurant_owner'),
('Alice Customer', 'alice@email.com', 'password123', 'user');

-- Insert Restaurants
INSERT INTO restaurants (owner_id, name, description, address, phone, image_url, rating) VALUES
(2, 'Mike\'s Pizza', 'Best pizza in town', '123 Main St, City', '+1234567890', 'pizza_restaurant.jpg', 4.5),
(2, 'Burger House', 'Gourmet burgers and fries', '456 Oak St, City', '+1234567891', 'burger_restaurant.jpg', 4.3);

-- Insert Menu Items for Mike's Pizza
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, preparation_time) VALUES
(1, 'Margherita Pizza', 'Classic tomato and mozzarella', 12.99, 'Pizza', 'margherita.jpg', 20),
(1, 'Pepperoni Pizza', 'Spicy pepperoni with cheese', 14.99, 'Pizza', 'pepperoni.jpg', 20),
(1, 'Garden Salad', 'Fresh mixed vegetables', 7.99, 'Salads', 'salad.jpg', 10);

-- Insert Menu Items for Burger House
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, preparation_time) VALUES
(2, 'Classic Burger', 'Beef patty with lettuce and tomato', 9.99, 'Burgers', 'classic_burger.jpg', 15),
(2, 'Cheese Fries', 'Crispy fries with melted cheese', 5.99, 'Sides', 'cheese_fries.jpg', 10),
(2, 'Milkshake', 'Vanilla milkshake', 4.99, 'Drinks', 'milkshake.jpg', 5);

-- Insert Sample Cart Items
INSERT INTO cart_items (user_id, menu_item_id, quantity, restaurant_id) VALUES
(3, 1, 2, 1),  -- 2 Margherita Pizzas for Alice
(3, 3, 1, 1);  -- 1 Garden Salad for Alice

-- Insert Sample Order
INSERT INTO orders (user_id, restaurant_id, total_amount, status, delivery_address, payment_method, payment_status) VALUES
(3, 1, 33.97, 'confirmed', '789 Pine St, City', 'credit_card', 'completed');

-- Insert Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
(1, 1, 2, 12.99),  -- 2 Margherita Pizzas
(1, 3, 1, 7.99);   -- 1 Garden Salad

-- Verify Data
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Cart Items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items; 