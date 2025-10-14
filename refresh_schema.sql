-- Check if cart_items table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'cart_items';

-- If it exists, refresh the schema cache
NOTIFY pgrst, 'reload schema';