-- Delivery Agents Table Schema
CREATE TABLE IF NOT EXISTS delivery_agents (
  id SERIAL PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicleType TEXT NOT NULL,
  licenseNumber TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  isApproved BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Allow all operations on delivery_agents" ON delivery_agents FOR ALL USING (true);

-- Sample data (optional)
INSERT INTO delivery_agents (userId, password, name, phone, vehicleType, licenseNumber) VALUES 
('DA123456', 'temp123', 'Rajesh Kumar', '9876543210', 'Bike', 'MH12AB1234'),
('DA789012', 'temp456', 'Amit Sharma', '9876543211', 'Car', 'MH12CD5678')
ON CONFLICT DO NOTHING;