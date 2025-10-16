-- Test data for order management system

-- Add sample delivery agents
INSERT INTO delivery_agents (userid, password, name, phone, vehicletype, licensenumber)
VALUES 
  ('DA123456', 'delivery123', 'Amit Kumar', '9876543212', 'Bike', 'MH15AB1234'),
  ('DA123457', 'delivery123', 'Suresh Patil', '9876543213', 'Scooter', 'MH15CD5678')
ON CONFLICT (userid) DO NOTHING;

-- Update existing orders to 'preparing' status so admin can mark them ready
UPDATE orders SET status = 'preparing' WHERE status IN ('pending', 'confirmed');

-- Add sample orders if none exist
INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, items, total_amount, status) 
VALUES 
  ('ORD001', 'Rajesh Patil', '9876543210', 'Shop No. 15, Main Market, Shirpur', '[{"name": "Rice", "quantity": 5, "price": 120}]', 600, 'preparing'),
  ('ORD002', 'Priya Sharma', '9876543211', 'House No. 23, Gandhi Nagar, Shirpur', '[{"name": "Wheat", "quantity": 10, "price": 45}]', 450, 'preparing')
ON CONFLICT (order_id) DO NOTHING;