-- SQL Functions for Supabase Database Operations

-- Function to update product stock when order is placed
CREATE OR REPLACE FUNCTION update_product_stock(product_id INTEGER, quantity_used INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stockQuantity = GREATEST(0, stockQuantity - quantity_used),
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment delivery agent's total deliveries
CREATE OR REPLACE FUNCTION increment_agent_deliveries(agent_phone TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE delivery_agents 
  SET total_deliveries = total_deliveries + 1,
      updated_at = NOW()
  WHERE phone = agent_phone;
END;
$$ LANGUAGE plpgsql;

-- Function to get order statistics
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'pending_orders', COUNT(*) FILTER (WHERE status = 'pending'),
    'processing_orders', COUNT(*) FILTER (WHERE status = 'processing'),
    'delivered_orders', COUNT(*) FILTER (WHERE status = 'delivered'),
    'total_revenue', COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0)
  ) INTO result
  FROM orders;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get product statistics
CREATE OR REPLACE FUNCTION get_product_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', COUNT(*),
    'active_products', COUNT(*) FILTER (WHERE isActive = true),
    'low_stock_products', COUNT(*) FILTER (WHERE stockQuantity < 10),
    'out_of_stock_products', COUNT(*) FILTER (WHERE stockQuantity = 0)
  ) INTO result
  FROM products;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_agents_updated_at ON delivery_agents;
CREATE TRIGGER update_delivery_agents_updated_at
  BEFORE UPDATE ON delivery_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();