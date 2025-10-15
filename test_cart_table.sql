-- Test cart_items table functionality
-- Run this in Supabase SQL Editor

-- Check if table exists and structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
ORDER BY ordinal_position;

-- Test insert
INSERT INTO cart_items (user_phone, product_id, quantity) 
VALUES ('test_user', 1, 2);

-- Test select
SELECT * FROM cart_items WHERE user_phone = 'test_user';

-- Clean up test data
DELETE FROM cart_items WHERE user_phone = 'test_user';

-- Final status
SELECT 'Cart table is working correctly!' as status;