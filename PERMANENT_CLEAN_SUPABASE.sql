-- PERMANENT SOLUTION: Clean Supabase database completely
-- Run this in your Supabase SQL Editor to fix the 30 products issue

-- Step 1: Delete ALL existing products (clean slate)
DELETE FROM public.products;

-- Step 2: Reset the sequence to start from 1
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Step 3: Insert only the 15 correct products
INSERT INTO public.products (name, description, price, image_url, category, stock_quantity, is_available) VALUES
('Basmati Rice 1kg', 'Premium quality basmati rice', 120.00, '/api/placeholder/300/200', 'groceries', 50, true),
('Toor Dal 1kg', 'Fresh toor dal', 150.00, '/api/placeholder/300/200', 'groceries', 30, true),
('Wheat Flour 1kg', 'Pure wheat flour', 45.00, '/api/placeholder/300/200', 'groceries', 40, true),
('Cooking Oil 1L', 'Refined cooking oil', 180.00, '/api/placeholder/300/200', 'groceries', 25, true),
('Sugar 1kg', 'White sugar', 55.00, '/api/placeholder/300/200', 'groceries', 35, true),
('Tea Powder 250g', 'Premium tea powder', 85.00, '/api/placeholder/300/200', 'beverages', 20, true),
('Milk 1L', 'Fresh milk', 65.00, '/api/placeholder/300/200', 'dairy', 15, true),
('Bread', 'Fresh bread loaf', 25.00, '/api/placeholder/300/200', 'bakery', 10, true),
('Onions 1kg', 'Fresh onions', 40.00, '/api/placeholder/300/200', 'vegetables', 60, true),
('Potatoes 1kg', 'Fresh potatoes', 35.00, '/api/placeholder/300/200', 'vegetables', 50, true),
('Tomatoes 1kg', 'Fresh tomatoes', 50.00, '/api/placeholder/300/200', 'vegetables', 45, true),
('Bananas 1kg', 'Fresh bananas', 60.00, '/api/placeholder/300/200', 'fruits', 30, true),
('Apples 1kg', 'Fresh apples', 120.00, '/api/placeholder/300/200', 'fruits', 25, true),
('Oranges 1kg', 'Fresh oranges', 80.00, '/api/placeholder/300/200', 'fruits', 35, true),
('Chicken 1kg', 'Fresh chicken', 250.00, '/api/placeholder/300/200', 'meat', 20, true);

-- Step 4: Verify only 15 products exist
SELECT COUNT(*) as total_products FROM public.products;
SELECT id, name, category, is_available FROM public.products ORDER BY id;