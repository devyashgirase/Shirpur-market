-- Create remaining tables for order management system

-- Delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
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
UPDATE orders SET updated_at = NOW() WHERE updated_at IS NULL;