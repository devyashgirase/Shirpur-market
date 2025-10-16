-- Add Pan Corner products to Supabase
-- Run this in Supabase SQL Editor

INSERT INTO products (name, description, price, category, stockQuantity, isActive, imageUrl) VALUES
('Plain Paan', 'Traditional betel leaf with sweet meetha', 15.00, 'Pan Corner', 100, true, '/placeholder.svg'),
('Meetha Paan', 'Sweet paan with gulkand and coconut', 25.00, 'Pan Corner', 80, true, '/placeholder.svg'),
('Chocolate Paan', 'Modern paan with chocolate coating', 35.00, 'Pan Corner', 60, true, '/placeholder.svg'),
('Ice Paan', 'Refreshing cold paan with ice crystals', 30.00, 'Pan Corner', 50, true, '/placeholder.svg'),
('Dry Fruit Paan', 'Premium paan with mixed dry fruits', 45.00, 'Pan Corner', 40, true, '/placeholder.svg'),
('Sada Paan', 'Simple traditional paan with basic ingredients', 12.00, 'Pan Corner', 120, true, '/placeholder.svg'),
('Calcutta Paan', 'Special Calcutta style paan', 40.00, 'Pan Corner', 35, true, '/placeholder.svg'),
('Banarasi Paan', 'Famous Banarasi style meetha paan', 38.00, 'Pan Corner', 45, true, '/placeholder.svg'),
('Fire Paan', 'Spicy hot paan with special masala', 32.00, 'Pan Corner', 30, true, '/placeholder.svg'),
('Silver Paan', 'Premium paan with silver coating', 55.00, 'Pan Corner', 25, true, '/placeholder.svg'),
('Gulkand Paan', 'Sweet paan with rose petal jam', 28.00, 'Pan Corner', 70, true, '/placeholder.svg'),
('Coconut Paan', 'Fresh paan with coconut flakes', 22.00, 'Pan Corner', 85, true, '/placeholder.svg')
ON CONFLICT (name) DO NOTHING;

-- Verify the products were added
SELECT * FROM products WHERE category = 'Pan Corner' ORDER BY price;