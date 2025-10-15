-- Force Supabase schema cache refresh
-- Run this in Supabase SQL Editor

-- Method 1: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Method 2: Force schema cache refresh by making a structural change
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS temp_refresh BOOLEAN DEFAULT FALSE;
ALTER TABLE cart_items DROP COLUMN IF EXISTS temp_refresh;

-- Method 3: Recreate the table to force recognition
DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_phone VARCHAR(20) NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX idx_cart_items_user_phone ON cart_items(user_phone);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_user_product ON cart_items(user_phone, product_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all operations for cart_items" ON cart_items;

-- Create new policy
CREATE POLICY "cart_items_policy" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);

-- Force a query to register the table
INSERT INTO cart_items (user_phone, product_id, quantity) VALUES ('test', 999, 1);
SELECT * FROM cart_items WHERE user_phone = 'test';
DELETE FROM cart_items WHERE user_phone = 'test';

-- Final verification
SELECT 'Schema cache refreshed - cart_items table ready!' as status;