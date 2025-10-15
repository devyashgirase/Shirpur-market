-- Setup cart functionality using customers table
-- Run this in Supabase SQL Editor

-- Add cart_data column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cart_data TEXT DEFAULT '[]';

-- Update existing customers to have empty cart
UPDATE customers SET cart_data = '[]' WHERE cart_data IS NULL;

-- Test the setup
SELECT 'Customers table cart setup complete!' as status;