-- Add location columns to delivery_agents table
ALTER TABLE delivery_agents 
ADD COLUMN current_lat DECIMAL(10, 8),
ADD COLUMN current_lng DECIMAL(11, 8),
ADD COLUMN last_location_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing agents with default location (optional)
UPDATE delivery_agents 
SET current_lat = 0.0, 
    current_lng = 0.0, 
    last_location_update = CURRENT_TIMESTAMP 
WHERE current_lat IS NULL;