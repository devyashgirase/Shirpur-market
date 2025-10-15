-- Fix existing orders table structure
-- Copy and paste this into Supabase SQL Editor

-- First check what columns exist
SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';

-- Make total column nullable if it exists
ALTER TABLE orders ALTER COLUMN total DROP NOT NULL;

-- Add missing columns if they don't exist (matching the code exactly)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);

-- Ensure created_at exists with proper default
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow all operations" ON orders;

-- Create permissive policy
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Test insert with both total columns
INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, total_amount, total, status, payment_status) 
VALUES ('TEST-' || extract(epoch from now())::text, 'Test User', '9999999999', 'Test Address', 100.00, 100.00, 'confirmed', 'paid')
ON CONFLICT DO NOTHING;

-- Show table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;

-- Show data
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;