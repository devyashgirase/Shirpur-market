-- Complete database setup for Shirpur Delivery System
-- Run this in Supabase SQL Editor

-- Create customers table with cart functionality
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  cart_data TEXT DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  imageUrl TEXT,
  stockQuantity INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
DROP POLICY IF EXISTS "customers_policy" ON customers;
CREATE POLICY "customers_policy" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for products
DROP POLICY IF EXISTS "products_policy" ON products;
CREATE POLICY "products_policy" ON products FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for orders
DROP POLICY IF EXISTS "orders_policy" ON orders;
CREATE POLICY "orders_policy" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert sample products if table is empty
INSERT INTO products (name, description, price, category, imageUrl, stockQuantity, isActive) 
SELECT * FROM (VALUES
  ('Fresh Tomatoes', 'Fresh red tomatoes', 40.00, 'Vegetables', '/placeholder.svg', 100, true),
  ('Basmati Rice', 'Premium basmati rice', 120.00, 'Grains', '/placeholder.svg', 50, true),
  ('Fresh Milk', 'Pure cow milk', 60.00, 'Dairy', '/placeholder.svg', 30, true)
) AS v(name, description, price, category, imageUrl, stockQuantity, isActive)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Test all tables
SELECT 'Database setup complete!' as status,
       (SELECT COUNT(*) FROM customers) as customers_count,
       (SELECT COUNT(*) FROM products) as products_count,
       (SELECT COUNT(*) FROM orders) as orders_count;