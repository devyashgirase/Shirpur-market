-- Add missing status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update any existing orders to have a status
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status';