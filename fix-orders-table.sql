-- Fix orders table structure for Supabase
-- Run this in Supabase SQL Editor

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  delivery_agent_id VARCHAR(50),
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for orders" ON orders;

-- Create permissive RLS policy for testing (you can make this more restrictive later)
CREATE POLICY "Enable all operations for orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

-- Insert a test order to verify the table works
INSERT INTO orders (
  order_id,
  customer_name,
  customer_phone,
  delivery_address,
  items,
  total_amount,
  status,
  payment_status,
  payment_id
) VALUES (
  'TEST-' || extract(epoch from now())::text,
  'Test Customer',
  '9999999999',
  'Test Address, Shirpur',
  '[{"product_id": 1, "product_name": "Test Product", "price": 100, "quantity": 1}]'::jsonb,
  100.00,
  'confirmed',
  'paid',
  'test_payment_' || extract(epoch from now())::text
) ON CONFLICT (order_id) DO NOTHING;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Count existing orders
SELECT COUNT(*) as total_orders FROM orders;

-- Show recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;