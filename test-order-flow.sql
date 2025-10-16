-- Test the complete order flow from admin to delivery agent

-- 1. Insert a test order in 'preparing' status
INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, items, total_amount, status, created_at) 
VALUES 
  ('TEST001', 'Test Customer', '9999999999', 'Test Address, Shirpur', '[{"name": "Test Product", "quantity": 1, "price": 100}]', 100, 'preparing', NOW())
ON CONFLICT (order_id) DO UPDATE SET 
  status = 'preparing',
  delivery_agent_id = NULL,
  delivery_agent_name = NULL;

-- 2. Check current orders
SELECT id, order_id, customer_name, status, delivery_agent_id, created_at 
FROM orders 
WHERE order_id = 'TEST001';

-- 3. Simulate admin marking order ready for delivery
UPDATE orders 
SET status = 'ready_for_delivery', updated_at = NOW() 
WHERE order_id = 'TEST001';

-- 4. Verify the order is now ready for delivery agents
SELECT id, order_id, customer_name, status, delivery_agent_id, delivery_agent_name, updated_at
FROM orders 
WHERE status = 'ready_for_delivery' AND delivery_agent_id IS NULL;

-- 5. Show all orders for debugging
SELECT id, order_id, customer_name, status, delivery_agent_id, delivery_agent_name, created_at, updated_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;