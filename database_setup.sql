-- Database Setup for Shirpur Market
DROP DATABASE IF EXISTS db_shirpur_market;
CREATE DATABASE db_shirpur_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_shirpur_market;

-- Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sku VARCHAR(100) UNIQUE,
    unit VARCHAR(50) DEFAULT 'kg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    address TEXT,
    coordinates JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Delivery Agents Table
CREATE TABLE delivery_agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_location JSON,
    rating DECIMAL(3,2) DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Data
INSERT INTO categories (name, slug) VALUES
('Grains', 'grains'),
('Pulses', 'pulses'),
('Oil', 'oil'),
('Dairy', 'dairy'),
('Vegetables', 'vegetables'),
('Fruits', 'fruits');

INSERT INTO products (name, description, price, category, stock_quantity, sku, unit) VALUES
('Basmati Rice', 'Premium basmati rice', 120.00, 'Grains', 50, 'RICE001', 'kg'),
('Toor Dal', 'Fresh toor dal', 85.00, 'Pulses', 30, 'DAL001', 'kg'),
('Sunflower Oil', 'Pure sunflower oil', 150.00, 'Oil', 25, 'OIL001', 'liter'),
('Fresh Milk', 'Farm fresh milk', 28.00, 'Dairy', 100, 'MILK001', 'liter'),
('Red Onions', 'Fresh red onions', 35.00, 'Vegetables', 40, 'VEG001', 'kg'),
('Bananas', 'Fresh bananas', 60.00, 'Fruits', 20, 'FRUIT001', 'dozen');

INSERT INTO delivery_agents (name, phone, rating, completed_deliveries) VALUES
('Ravi Kumar', '+919876543210', 4.5, 150),
('Suresh Patil', '+919876543211', 4.2, 120);