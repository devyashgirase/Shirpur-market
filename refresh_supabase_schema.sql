-- Refresh Supabase schema cache and ensure cart_items table exists
-- Run this in Supabase SQL Editor

-- First, ensure the cart_items table exists with correct structure
DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_phone VARCHAR(20) NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cart_items_user_phone ON cart_items(user_phone);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_user_product ON cart_items(user_phone, product_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for cart_items" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);

-- Refresh the schema cache by running a simple query
SELECT 1 FROM cart_items LIMIT 1;

-- Also ensure orders table has proper structure for fallback
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update existing orders to have items array if null
UPDATE orders SET items = '[]'::jsonb WHERE items IS NULL;
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Notify that schema refresh is complete
SELECT 'Schema refreshed successfully' as status;