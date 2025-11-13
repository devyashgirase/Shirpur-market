-- Fix Supabase products - Set all valid products to available
-- Run this in your Supabase SQL Editor

-- First, clean up unwanted products
DELETE FROM public.products 
WHERE name LIKE 'CART_%' 
   OR name IN ('coco-cola', 'pizza', 'pizza2', 'sdfsdf', 'Yash Spacial Biryani', 'dffgdfg', 'pizza ');

-- Set all remaining products to available
UPDATE public.products 
SET is_available = true 
WHERE is_available = false;

-- Verify the fix
SELECT id, name, category, is_available, stock_quantity, price 
FROM public.products 
WHERE is_available = true
ORDER BY id;