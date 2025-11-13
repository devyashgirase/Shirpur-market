-- FORCE DELETE ALL DATA FROM SUPABASE DATABASE
-- Run this in your Supabase SQL Editor at https://ftexuxkdfahbqjddidaf.supabase.co

-- Delete all data in correct order to avoid foreign key errors
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

-- Reset sequences
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS delivery_agents_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_carts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS delivery_tracking_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS feedback_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inventory_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS carousel_banners_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'products' as table_name, COUNT(*) as count FROM public.products
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'delivery_agents', COUNT(*) FROM public.delivery_agents;