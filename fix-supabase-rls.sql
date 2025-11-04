-- Fix Supabase RLS policies to allow inserts
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily for testing (OPTION 1 - Quick fix)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_otps DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_sessions DISABLE ROW LEVEL SECURITY;

-- OR create proper RLS policies (OPTION 2 - Secure approach)
-- Uncomment below if you want to keep RLS enabled with proper policies

/*
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_agents" ON delivery_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_otps" ON delivery_otps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_completions" ON delivery_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_sessions" ON delivery_sessions FOR ALL USING (true) WITH CHECK (true);
*/