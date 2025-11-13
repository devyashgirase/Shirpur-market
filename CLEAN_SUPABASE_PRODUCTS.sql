-- Clean up Supabase products table to remove unwanted data
-- Run this in your Supabase SQL Editor

-- First, delete all CART_ products and test products
DELETE FROM public.products 
WHERE name LIKE 'CART_%' 
   OR name IN ('coco-cola', 'pizza', 'pizza2', 'sdfsdf', 'Yash Spacial Biryani', 'dffgdfg');

-- Verify remaining products
SELECT id, name, category, is_available, stock_quantity, price 
FROM public.products 
ORDER BY id;

-- Should show only 15 products:
-- 1. Basmati Rice 1kg
-- 2. Toor Dal 1kg  
-- 3. Wheat Flour 1kg
-- 4. Cooking Oil 1L
-- 5. Sugar 1kg
-- 6. Tea Powder 250g
-- 7. Milk 1L
-- 8. Bread
-- 9. Onions 1kg
-- 10. Potatoes 1kg
-- 11. Tomatoes 1kg
-- 12. Bananas 1kg
-- 13. Apples 1kg
-- 14. Oranges 1kg
-- 15. Chicken 1kg