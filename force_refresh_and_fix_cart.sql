-- Force refresh schema and fix cart using orders table
-- Run this in Supabase SQL Editor

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Make structural change to force cache refresh
ALTER TABLE customers ADD COLUMN IF NOT EXISTS temp_col INTEGER DEFAULT 1;
ALTER TABLE customers DROP COLUMN IF EXISTS temp_col;

-- Ensure cart_data column exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cart_data TEXT DEFAULT '[]';

-- Force another refresh
ALTER TABLE customers ADD COLUMN IF NOT EXISTS temp_col2 INTEGER DEFAULT 1;
ALTER TABLE customers DROP COLUMN IF EXISTS temp_col2;

-- Test the column
UPDATE customers SET cart_data = '[]' WHERE cart_data IS NULL;

-- Final test
SELECT 'Cart column ready!' as status, 
       column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'cart_data';