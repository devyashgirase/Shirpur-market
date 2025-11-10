-- Disable Row Level Security for development
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_rejections DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_otps DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_completions DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON orders;

-- Grant full access to anon role for development
GRANT ALL ON products TO anon;
GRANT ALL ON orders TO anon;
GRANT ALL ON customers TO anon;
GRANT ALL ON delivery_agents TO anon;
GRANT ALL ON user_carts TO anon;
GRANT ALL ON carousel_items TO anon;
GRANT ALL ON order_rejections TO anon;
GRANT ALL ON delivery_sessions TO anon;
GRANT ALL ON delivery_otps TO anon;
GRANT ALL ON delivery_completions TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;