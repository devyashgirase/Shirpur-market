-- Fix Orders Table - Add missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(15);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'confirmed';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

SELECT 'Orders table updated with missing columns!' as message;