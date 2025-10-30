-- Final orders table creation for Supabase
-- Run this in Supabase SQL Editor

-- Drop existing table if needed (CAUTION: This will delete all data)
-- DROP TABLE IF EXISTS orders;

-- Create orders table with exact structure needed
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'confirmed',
  payment_status VARCHAR(50) DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Enable all operations for all users" ON orders;

-- Create permissive policy for all operations
CREATE POLICY "Enable all operations for all users" ON orders
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Test insert to verify table works
INSERT INTO orders (
  order_id, 
  customer_name, 
  customer_phone, 
  customer_address, 
  items, 
  total_amount
) VALUES (
  'TEST-' || extract(epoch from now())::text,
  'Test Customer',
  '9999999999',
  'Test Address, Shirpur',
  '[{"product_id": 1, "product_name": "Test Product", "price": 100, "quantity": 1}]'::jsonb,
  100.00
) ON CONFLICT (order_id) DO NOTHING;

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Show recent orders
SELECT 
  id,
  order_id,
  customer_name,
  total_amount,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;