-- COMPLETE FRESH START: Delete all data and recreate everything
-- Run this in your Supabase SQL Editor

-- Step 1: Delete all data from all tables (in correct order to avoid foreign key issues)
DELETE FROM public.feedback;
DELETE FROM public.inventory_logs;
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.cart_items;
DELETE FROM public.user_carts;
DELETE FROM public.delivery_tracking;
DELETE FROM public.delivery_agents;
DELETE FROM public.customers;
DELETE FROM public.products;
DELETE FROM public.carousel_banners;

-- Step 2: Reset all sequences to start from 1
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE delivery_agents_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE user_carts_id_seq RESTART WITH 1;
ALTER SEQUENCE cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE delivery_tracking_id_seq RESTART WITH 1;
ALTER SEQUENCE feedback_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE carousel_banners_id_seq RESTART WITH 1;

-- Step 3: Insert fresh sample data - ONLY 15 PRODUCTS
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

-- Step 4: Insert sample customers
INSERT INTO public.customers (phone, name, email, address, latitude, longitude, loyalty_points) VALUES
('+919876543210', 'Rahul Sharma', 'rahul@example.com', 'Shirpur, Maharashtra', 21.3487, 74.8831, 150),
('+919876543211', 'Priya Patel', 'priya@example.com', 'Near Bus Stand, Shirpur', 21.3500, 74.8850, 200),
('+919876543212', 'Amit Kumar', 'amit@example.com', 'Market Area, Shirpur', 21.3470, 74.8820, 100),
('+919876543213', 'Sunita Devi', 'sunita@example.com', 'Railway Station Road, Shirpur', 21.3520, 74.8870, 75),
('+919876543214', 'Vikash Singh', 'vikash@example.com', 'College Road, Shirpur', 21.3450, 74.8800, 300);

-- Step 5: Insert sample delivery agents
INSERT INTO public.delivery_agents (name, phone, email, current_latitude, current_longitude, total_deliveries, rating) VALUES
('Ravi Delivery', '+919876540001', 'ravi@delivery.com', 21.3487, 74.8831, 150, 4.8),
('Suresh Delivery', '+919876540002', 'suresh@delivery.com', 21.3500, 74.8850, 200, 4.9),
('Mahesh Delivery', '+919876540003', 'mahesh@delivery.com', 21.3470, 74.8820, 100, 4.7),
('Ganesh Delivery', '+919876540004', 'ganesh@delivery.com', 21.3520, 74.8870, 180, 4.6),
('Ramesh Delivery', '+919876540005', 'ramesh@delivery.com', 21.3450, 74.8800, 220, 4.9);

-- Step 6: Insert sample carousel banners
INSERT INTO public.carousel_banners (title, description, image_url, is_active, display_order) VALUES
('Welcome to Shirpur Market', 'Fresh groceries delivered to your doorstep', '/api/placeholder/800/400', true, 1),
('Special Offers', 'Get 20% off on your first order', '/api/placeholder/800/400', true, 2),
('Fresh Vegetables', 'Farm fresh vegetables daily', '/api/placeholder/800/400', true, 3),
('Quick Delivery', 'Delivery within 30 minutes', '/api/placeholder/800/400', true, 4),
('Quality Products', 'Best quality at best prices', '/api/placeholder/800/400', true, 5);

-- Step 7: Verify fresh data
SELECT 'PRODUCTS' as table_name, COUNT(*) as count FROM public.products
UNION ALL
SELECT 'CUSTOMERS', COUNT(*) FROM public.customers
UNION ALL
SELECT 'DELIVERY_AGENTS', COUNT(*) FROM public.delivery_agents
UNION ALL
SELECT 'ORDERS', COUNT(*) FROM public.orders
UNION ALL
SELECT 'CAROUSEL_BANNERS', COUNT(*) FROM public.carousel_banners;

-- Final verification - should show exactly 15 products
SELECT id, name, category, is_available, stock_quantity FROM public.products ORDER BY id;