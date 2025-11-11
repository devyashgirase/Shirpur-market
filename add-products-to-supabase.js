// Add products directly to Supabase
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

const products = [
  { name: 'Basmati Rice 1kg', description: 'Premium quality basmati rice', price: 120.00, category: 'groceries', stock_quantity: 50, is_available: true },
  { name: 'Toor Dal 1kg', description: 'Fresh toor dal', price: 150.00, category: 'groceries', stock_quantity: 30, is_available: true },
  { name: 'Wheat Flour 1kg', description: 'Pure wheat flour', price: 45.00, category: 'groceries', stock_quantity: 40, is_available: true },
  { name: 'Cooking Oil 1L', description: 'Refined cooking oil', price: 180.00, category: 'groceries', stock_quantity: 25, is_available: true },
  { name: 'Sugar 1kg', description: 'White sugar', price: 55.00, category: 'groceries', stock_quantity: 35, is_available: true },
  { name: 'Tea Powder 250g', description: 'Premium tea powder', price: 85.00, category: 'beverages', stock_quantity: 20, is_available: true },
  { name: 'Milk 1L', description: 'Fresh milk', price: 65.00, category: 'dairy', stock_quantity: 15, is_available: true },
  { name: 'Bread', description: 'Fresh bread loaf', price: 25.00, category: 'bakery', stock_quantity: 10, is_available: true },
  { name: 'Onions 1kg', description: 'Fresh onions', price: 40.00, category: 'vegetables', stock_quantity: 60, is_available: true },
  { name: 'Potatoes 1kg', description: 'Fresh potatoes', price: 35.00, category: 'vegetables', stock_quantity: 50, is_available: true },
  { name: 'Tomatoes 1kg', description: 'Fresh tomatoes', price: 50.00, category: 'vegetables', stock_quantity: 45, is_available: true },
  { name: 'Bananas 1kg', description: 'Fresh bananas', price: 60.00, category: 'fruits', stock_quantity: 30, is_available: true },
  { name: 'Apples 1kg', description: 'Fresh apples', price: 120.00, category: 'fruits', stock_quantity: 25, is_available: true },
  { name: 'Oranges 1kg', description: 'Fresh oranges', price: 80.00, category: 'fruits', stock_quantity: 35, is_available: true },
  { name: 'Chicken 1kg', description: 'Fresh chicken', price: 250.00, category: 'meat', stock_quantity: 20, is_available: true }
];

async function addProductsToSupabase() {
  console.log('🚀 Adding products to Supabase...');
  
  for (const product of products) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Added:', product.name);
      } else {
        const error = await response.text();
        console.log('❌ Failed to add', product.name, ':', response.status, error);
      }
    } catch (error) {
      console.error('❌ Error adding', product.name, ':', error.message);
    }
  }
  
  console.log('🎉 Products addition complete!');
}

addProductsToSupabase();