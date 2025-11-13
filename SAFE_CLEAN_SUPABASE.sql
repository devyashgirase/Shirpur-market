-- SAFE SOLUTION: Clean products without breaking foreign keys
-- Run this in your Supabase SQL Editor

-- Step 1: Disable unwanted products instead of deleting
UPDATE public.products 
SET is_available = false 
WHERE name LIKE 'CART_%' 
   OR name IN ('coco-cola', 'pizza', 'pizza2', 'sdfsdf', 'Yash Spacial Biryani', 'dffgdfg', 'pizza ');

-- Step 2: Enable only the 15 original products
UPDATE public.products 
SET is_available = true 
WHERE name IN (
  'Basmati Rice 1kg', 'Toor Dal 1kg', 'Wheat Flour 1kg', 'Cooking Oil 1L', 'Sugar 1kg',
  'Tea Powder 250g', 'Milk 1L', 'Bread', 'Onions 1kg', 'Potatoes 1kg',
  'Tomatoes 1kg', 'Bananas 1kg', 'Apples 1kg', 'Oranges 1kg', 'Chicken 1kg'
);

-- Step 3: Verify only enabled products
SELECT COUNT(*) as enabled_products FROM public.products WHERE is_available = true;
SELECT id, name, category, is_available FROM public.products WHERE is_available = true ORDER BY id;