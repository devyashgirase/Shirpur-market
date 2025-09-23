-- Add sample products to your database
USE db_shirpur_market;

INSERT INTO products (name, description, price, image_url, category, stock_quantity, is_active) VALUES
('Basmati Rice Premium', 'Premium quality aged basmati rice', 120.00, '', 'Grains', 50, 1),
('Toor Dal', 'Fresh toor dal from Maharashtra', 85.00, '', 'Pulses', 30, 1),
('Sunflower Oil', 'Pure sunflower cooking oil', 150.00, '', 'Oil', 25, 1),
('Fresh Milk', 'Farm fresh full cream milk', 28.00, '', 'Dairy', 100, 1),
('Red Onions', 'Fresh red onions from Nashik', 35.00, '', 'Vegetables', 40, 1),
('Bananas', 'Fresh ripe bananas', 60.00, '', 'Fruits', 20, 1),
('Wheat Flour', 'Premium wheat flour', 45.00, '', 'Grains', 60, 1),
('Moong Dal', 'Fresh moong dal', 95.00, '', 'Pulses', 35, 1),
('Mustard Oil', 'Pure mustard oil', 180.00, '', 'Oil', 20, 1),
('Paneer', 'Fresh paneer', 80.00, '', 'Dairy', 15, 1);