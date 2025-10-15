-- Simple cart setup using user_carts table
-- Run this in Supabase SQL Editor

-- Create a simple cart table
CREATE TABLE IF NOT EXISTS user_carts (
  id SERIAL PRIMARY KEY,
  user_phone VARCHAR(20) NOT NULL,
  cart_data TEXT DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_carts_phone ON user_carts(user_phone);

-- Enable RLS
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "user_carts_policy" ON user_carts;
CREATE POLICY "user_carts_policy" ON user_carts FOR ALL USING (true) WITH CHECK (true);

-- Test the table
INSERT INTO user_carts (user_phone, cart_data) VALUES ('test_user', '[]') 
ON CONFLICT (user_phone) DO UPDATE SET cart_data = '[]';

SELECT * FROM user_carts WHERE user_phone = 'test_user';

DELETE FROM user_carts WHERE user_phone = 'test_user';

SELECT 'Simple cart table ready!' as status;