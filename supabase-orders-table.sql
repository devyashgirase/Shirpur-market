-- Create orders table for Shirpur Delivery System
-- Copy and paste this into Supabase SQL Editor

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  payment_status VARCHAR(50) DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policy
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);