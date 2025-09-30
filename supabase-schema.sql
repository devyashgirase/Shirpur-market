-- Shirpur Delivery System - Production Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery')),
    is_first_login_complete BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'general',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sku VARCHAR(50) UNIQUE,
    unit VARCHAR(20) DEFAULT 'kg',
    is_age_restricted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_coordinates JSONB,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    order_status VARCHAR(20) DEFAULT 'pending',
    delivery_agent_id BIGINT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery agents table
CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    license_number VARCHAR(50),
    current_location JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    preferred_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    customer_phone VARCHAR(15) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id),
    change_type VARCHAR(20) NOT NULL, -- 'stock_in', 'stock_out', 'adjustment'
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_available ON delivery_agents(is_available);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);

-- Insert sample data
INSERT INTO products (name, description, price, category, stock_quantity, sku, unit) VALUES
('Basmati Rice', 'Premium quality basmati rice', 120.00, 'grains', 100, 'RICE001', 'kg'),
('Toor Dal', 'Fresh toor dal', 85.00, 'pulses', 50, 'DAL001', 'kg'),
('Wheat Flour', 'Whole wheat flour', 45.00, 'grains', 75, 'FLOUR001', 'kg'),
('Onions', 'Fresh red onions', 25.00, 'vegetables', 200, 'VEG001', 'kg'),
('Tomatoes', 'Fresh tomatoes', 30.00, 'vegetables', 150, 'VEG002', 'kg'),
('Potatoes', 'Fresh potatoes', 20.00, 'vegetables', 180, 'VEG003', 'kg'),
('Milk', 'Fresh cow milk', 55.00, 'dairy', 40, 'DAIRY001', 'liter'),
('Bread', 'Whole wheat bread', 25.00, 'bakery', 30, 'BREAD001', 'piece'),
('Cooking Oil', 'Refined sunflower oil', 140.00, 'oil', 60, 'OIL001', 'liter'),
('Sugar', 'White crystal sugar', 42.00, 'grocery', 80, 'SUGAR001', 'kg')
ON CONFLICT (sku) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Products: Allow read access to all, write access to admins only
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.phone = auth.jwt() ->> 'phone' AND users.role = 'admin')
);

-- Orders: Users can only see their own orders, admins and delivery agents can see all
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (
    customer_phone = auth.jwt() ->> 'phone' OR
    EXISTS (SELECT 1 FROM users WHERE users.phone = auth.jwt() ->> 'phone' AND users.role IN ('admin', 'delivery'))
);

CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (
    customer_phone = auth.jwt() ->> 'phone'
);

-- Delivery agents: Can view their own profile and orders assigned to them
CREATE POLICY "Delivery agents can view their profile" ON delivery_agents FOR SELECT USING (
    phone = auth.jwt() ->> 'phone' OR
    EXISTS (SELECT 1 FROM users WHERE users.phone = auth.jwt() ->> 'phone' AND users.role = 'admin')
);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_agents_updated_at BEFORE UPDATE ON delivery_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate order IDs
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_sequence')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order IDs
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

COMMENT ON TABLE users IS 'User accounts for customers, admins, and delivery partners';
COMMENT ON TABLE products IS 'Product catalog with inventory management';
COMMENT ON TABLE orders IS 'Customer orders with delivery tracking';
COMMENT ON TABLE delivery_agents IS 'Delivery partner profiles and availability';
COMMENT ON TABLE customers IS 'Customer profiles with loyalty program';
COMMENT ON TABLE feedback IS 'Customer feedback and ratings';
COMMENT ON TABLE inventory_logs IS 'Product inventory change tracking';
COMMENT ON TABLE otp_verifications IS 'OTP verification for phone authentication';