import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'x-signalr-user-agent']
}));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dev_yash2025',
  database: 'db_shirpur_market'
});

db.connect((err) => {
  if (err) console.error('❌ DB Error:', err);
  else console.log('✅ Connected to db_shirpur_market');
});

// Products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products WHERE is_active = 1', (err, results) => {
    res.json(err ? [] : results);
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, imageUrl, category, stockQuantity, isActive } = req.body;
  db.query(
    'INSERT INTO products (name, description, price, image_url, category, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, price, imageUrl, category, stockQuantity, isActive],
    (err, result) => res.json(err ? { error: err.message } : { id: result.insertId, ...req.body })
  );
});

// Orders
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    res.json(err ? [] : results);
  });
});

app.post('/api/orders', (req, res) => {
  const { orderId, customerName, customerPhone, deliveryAddress, total, status, paymentStatus, items } = req.body;
  db.query(
    'INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, total, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [orderId, customerName, customerPhone, deliveryAddress, total, status, paymentStatus],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      const orderDbId = result.insertId;
      if (items) {
        items.forEach(item => {
          db.query(
            'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
            [orderDbId, item.productId, item.productName, item.price, item.quantity, item.price * item.quantity]
          );
        });
      }
      res.json({ id: orderDbId, orderId, ...req.body });
    }
  );
});

app.put('/api/orders/:id/status', (req, res) => {
  db.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id], (err) => {
    res.json(err ? { error: err.message } : { success: true });
  });
});

// Customers
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM customers ORDER BY created_at DESC', (err, results) => {
    res.json(err ? [] : results);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, phone, email, address } = req.body;
  db.query(
    'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [name, phone, email, address],
    (err, result) => res.json(err ? { error: err.message } : { id: result.insertId, ...req.body })
  );
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, email, address } = req.body;
  db.query(
    'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
    [name, phone, email, address, req.params.id],
    (err) => res.json(err ? { error: err.message } : { success: true })
  );
});

// Delivery Agents
app.get('/api/delivery-agents', (req, res) => {
  db.query('SELECT * FROM delivery_agents ORDER BY created_at DESC', (err, results) => {
    res.json(err ? [] : results);
  });
});

app.post('/api/delivery-agents', (req, res) => {
  const { name, phone, email, vehicleType, licenseNumber, isActive } = req.body;
  db.query(
    'INSERT INTO delivery_agents (name, phone, email, vehicle_type, license_number, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone, email, vehicleType, licenseNumber, isActive],
    (err, result) => res.json(err ? { error: err.message } : { id: result.insertId, ...req.body })
  );
});

app.put('/api/delivery-agents/:id/status', (req, res) => {
  db.query('UPDATE delivery_agents SET is_active = ? WHERE id = ?', [req.body.isActive, req.params.id], (err) => {
    res.json(err ? { error: err.message } : { success: true });
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories WHERE is_active = 1', (err, results) => {
    res.json(err ? [] : results);
  });
});

app.post('/api/categories', (req, res) => {
  const { name, description, isActive } = req.body;
  db.query(
    'INSERT INTO categories (name, description, is_active) VALUES (?, ?, ?)',
    [name, description, isActive],
    (err, result) => res.json(err ? { error: err.message } : { id: result.insertId, ...req.body })
  );
});

// Enhanced Products
app.put('/api/products/:id', (req, res) => {
  const { name, description, price, imageUrl, category, stockQuantity, isActive } = req.body;
  db.query(
    'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock_quantity = ?, is_active = ? WHERE id = ?',
    [name, description, price, imageUrl, category, stockQuantity, isActive, req.params.id],
    (err) => res.json(err ? { error: err.message } : { success: true })
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id], (err) => {
    res.json(err ? { error: err.message } : { success: true });
  });
});

// Order Items
app.get('/api/orders/:id/items', (req, res) => {
  db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id], (err, results) => {
    res.json(err ? [] : results);
  });
});

app.listen(5000, () => console.log('🚀 Server: http://localhost:5000'));