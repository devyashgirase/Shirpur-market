-- Order Management System Tables for Supabase

-- Add missing columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_agent_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_agent_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update status column to allow new values
ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(50);

-- Delivery agents table (if not exists)
CREATE TABLE IF NOT EXISTS delivery_agents (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  vehicletype VARCHAR(50),
  licensenumber VARCHAR(100),
  profilephoto TEXT,
  isactive BOOLEAN DEFAULT true,
  isapproved BOOLEAN DEFAULT true,
  createdat TIMESTAMP DEFAULT NOW()
);

-- Delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Order rejections table
CREATE TABLE IF NOT EXISTS order_rejections (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  reason TEXT,
  rejected_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_agent ON orders(delivery_agent_id);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);

-- Update existing orders to have proper status values
UPDATE orders SET status = 'preparing' WHERE status = 'confirmed';
UPDATE orders SET updated_at = NOW() WHERE updated_at IS NULL;

-- Sample data for testing
INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, items, total_amount, status) 
VALUES 
  ('ORD001', 'Rajesh Patil', '9876543210', 'Shop No. 15, Main Market, Shirpur', '[{"name": "Rice", "quantity": 5, "price": 120}]', 600, 'preparing'),
  ('ORD002', 'Priya Sharma', '9876543211', 'House No. 23, Gandhi Nagar, Shirpur', '[{"name": "Wheat", "quantity": 10, "price": 45}]', 450, 'preparing')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO delivery_agents (userid, password, name, phone, vehicletype, licensenumber)
VALUES 
  ('DA123456', 'delivery123', 'Amit Kumar', '9876543212', 'Bike', 'MH15AB1234'),
  ('DA123457', 'delivery123', 'Suresh Patil', '9876543213', 'Scooter', 'MH15CD5678')
ON CONFLICT (userid) DO NOTHING;