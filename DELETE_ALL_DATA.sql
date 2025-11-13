-- DELETE ALL DATA FROM ALL TABLES
-- Run this in your Supabase SQL Editor

-- Delete all data from all tables (in correct order)
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

-- Reset all sequences to start from 1
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

-- Verify all tables are empty
SELECT 'PRODUCTS' as table_name, COUNT(*) as count FROM public.products
UNION ALL
SELECT 'CUSTOMERS', COUNT(*) FROM public.customers
UNION ALL
SELECT 'DELIVERY_AGENTS', COUNT(*) FROM public.delivery_agents
UNION ALL
SELECT 'ORDERS', COUNT(*) FROM public.orders
UNION ALL
SELECT 'ORDER_ITEMS', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'CART_ITEMS', COUNT(*) FROM public.cart_items
UNION ALL
SELECT 'USER_CARTS', COUNT(*) FROM public.user_carts
UNION ALL
SELECT 'DELIVERY_TRACKING', COUNT(*) FROM public.delivery_tracking
UNION ALL
SELECT 'FEEDBACK', COUNT(*) FROM public.feedback
UNION ALL
SELECT 'INVENTORY_LOGS', COUNT(*) FROM public.inventory_logs
UNION ALL
SELECT 'CAROUSEL_BANNERS', COUNT(*) FROM public.carousel_banners;