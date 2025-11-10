// Test actual web page data flow
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testWebFlow() {
  console.log('🌐 Testing Web Page Data Flow\n');

  // Test 1: Admin adds product (like from admin panel)
  console.log('👨‍💼 Admin adds product...');
  const adminProduct = {
    name: 'Fresh Onions',
    description: 'Premium quality red onions',
    price: 30.00,
    category: 'vegetables',
    stock_quantity: 100,
    image_url: '/placeholder.svg',
    is_active: true,
    sku: 'ONION' + Date.now(),
    unit: 'kg'
  };

  const productResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(adminProduct)
  });

  if (productResponse.ok) {
    const product = await productResponse.json();
    console.log('✅ Product added by admin! ID:', product[0].id);
  }

  // Test 2: Customer places order (like from customer page)
  console.log('\n🛒 Customer places order...');
  const customerOrder = {
    order_id: 'WEB-' + Date.now(),
    customer_name: 'Web Test Customer',
    customer_phone: '7777777777',
    customer_address: 'Test Address, Shirpur',
    items: JSON.stringify([
      { name: 'Fresh Onions', quantity: 2, price: 30 },
      { name: 'Tomatoes', quantity: 1, price: 40 }
    ]),
    total_amount: 100.00,
    order_status: 'confirmed',
    payment_status: 'paid'
  };

  const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(customerOrder)
  });

  if (orderResponse.ok) {
    const order = await orderResponse.json();
    console.log('✅ Order placed by customer! ID:', order[0].id);
  }

  console.log('\n🎉 Web flow test complete!');
  console.log('💡 Your web pages can now save data to Supabase!');
}

testWebFlow();