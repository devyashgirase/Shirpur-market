-- Pan Corner Products for Shirpur Delivery System
-- Add these products to your Supabase database

INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_active) VALUES
-- Traditional Pan Items
('Fresh Betel Leaves', 'Premium quality fresh betel leaves - perfect for making traditional pan', 25.00, 'pan-corner', 'https://images.unsplash.com/photo-1609501676725-7186f734b2b0?w=400', 100, true),
('Pan Masala Mix', 'Traditional pan masala ingredients blend with cardamom, fennel and rose petals', 45.00, 'pan-corner', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 50, true),
('Supari (Areca Nut)', 'Fresh supari for authentic pan making - premium quality', 120.00, 'pan-corner', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 30, true),
('Gulkand (Rose Petal Jam)', 'Sweet rose petal preserve for delicious pan', 85.00, 'pan-corner', 'https://images.unsplash.com/photo-1587736797123-c8c6b8b4b8b8?w=400', 25, true),

-- Cigarettes & Tobacco
('Gold Flake Cigarettes', 'Premium cigarettes - Age verification required (18+)', 150.00, 'pan-corner', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 20, true),
('Classic Cigarettes', 'Regular cigarettes - Age verification required (18+)', 120.00, 'pan-corner', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 25, true),
('Marlboro Red', 'International brand cigarettes - Age verification required (18+)', 200.00, 'pan-corner', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 15, true),
('Tobacco Pouch', 'Premium tobacco for rolling - Age verification required (18+)', 80.00, 'pan-corner', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 30, true),

-- Wine & Alcohol
('Red Wine Bottle', 'Premium red wine - Age verification required (21+)', 800.00, 'pan-corner', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', 10, true),
('White Wine', 'Crisp white wine - Age verification required (21+)', 750.00, 'pan-corner', 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400', 8, true),
('Beer Bottles (6 Pack)', 'Premium beer pack - Age verification required (21+)', 350.00, 'pan-corner', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', 12, true),
('Whiskey Bottle', 'Premium whiskey - Age verification required (21+)', 1200.00, 'pan-corner', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', 5, true),

-- Pan Accessories
('Silver Foil Sheets', 'Food grade silver foil for pan decoration', 15.00, 'pan-corner', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 60, true),
('Coconut Powder', 'Fresh coconut powder for pan preparation', 35.00, 'pan-corner', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 40, true),
('Cardamom Seeds', 'Premium green cardamom for aromatic pan', 150.00, 'pan-corner', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 20, true),
('Fennel Seeds (Saunf)', 'Sweet fennel seeds for pan flavoring', 60.00, 'pan-corner', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 35, true),

-- Snacks & Extras
('Roasted Peanuts', 'Crispy roasted peanuts - perfect snack', 40.00, 'pan-corner', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 50, true),
('Salted Cashews', 'Premium salted cashews', 180.00, 'pan-corner', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 25, true),
('Pan Corner Special Mix', 'House special mix of nuts and spices', 95.00, 'pan-corner', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 30, true);