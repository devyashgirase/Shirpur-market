-- Complete Supabase Schema for All 3 Panels

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  imageUrl TEXT,
  category VARCHAR(100) NOT NULL,
  stockQuantity INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery agents table
CREATE TABLE IF NOT EXISTS delivery_agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  vehicle_type VARCHAR(100),
  license_number VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  total_deliveries INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  customer_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for all panels

-- Categories
INSERT INTO categories (name, slug) VALUES 
('Vegetables', 'vegetables'),
('Fruits', 'fruits'),
('Grains', 'grains'),
('Dairy', 'dairy'),
('Spices', 'spices')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (name, description, price, imageUrl, category, stockQuantity) VALUES 
('Fresh Tomatoes', 'Red ripe tomatoes', 40.00, '/placeholder.svg', 'Vegetables', 100),
('Basmati Rice', 'Premium quality rice', 120.00, '/placeholder.svg', 'Grains', 50),
('Fresh Milk', 'Pure cow milk', 60.00, '/placeholder.svg', 'Dairy', 30),
('Onions', 'Fresh red onions', 35.00, '/placeholder.svg', 'Vegetables', 80),
('Bananas', 'Ripe yellow bananas', 50.00, '/placeholder.svg', 'Fruits', 60)
ON CONFLICT DO NOTHING;

-- Delivery Agents
INSERT INTO delivery_agents (name, phone, email, vehicle_type, license_number) VALUES 
('Rahul Sharma', '9876543210', 'rahul@example.com', 'Motorcycle', 'MH12AB1234'),
('Priya Patel', '9876543211', 'priya@example.com', 'Bicycle', 'MH12CD5678'),
('Amit Kumar', '9876543212', 'amit@example.com', 'Motorcycle', 'MH12EF9012')
ON CONFLICT (phone) DO NOTHING;

-- Sample Customer
INSERT INTO customers (name, phone, email, address) VALUES 
('John Doe', '9999999999', 'john@example.com', '123 Main Street, Shirpur'),
('Jane Smith', '8888888888', 'jane@example.com', '456 Oak Avenue, Shirpur')
ON CONFLICT (phone) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_agents" ON delivery_agents FOR ALL USING (true);
CREATE POLICY "Allow all operations on feedback" ON feedback FOR ALL USING (true);