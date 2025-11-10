// Test data saving after RLS fix
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testAfterRLSFix() {
  console.log('🧪 Testing data operations after RLS fix...\n');

  // Test creating a product
  console.log('📝 Creating test product...');
  try {
    const testProduct = {
      name: 'RLS Fix Test Product',
      description: 'Testing after disabling RLS',
      price: 25.50,
      category: 'test',
      stock_quantity: 100,
      image_url: '/placeholder.svg',
      is_active: true,
      sku: 'RLSTEST' + Date.now(),
      unit: 'kg'
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testProduct)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product created successfully!');
      console.log('📦 Product ID:', result[0].id, 'Name:', result[0].name);
    } else {
      const error = await response.text();
      console.log('❌ Product creation failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test creating an order
  console.log('\n📝 Creating test order...');
  try {
    const testOrder = {
      order_id: 'RLSTEST-' + Date.now(),
      customer_name: 'RLS Test Customer',
      customer_phone: '9999999999',
      customer_address: 'Test Address for RLS Fix',
      items: JSON.stringify([
        { name: 'Test Item 1', quantity: 2, price: 25.50 },
        { name: 'Test Item 2', quantity: 1, price: 15.00 }
      ]),
      total_amount: 66.00,
      order_status: 'confirmed',
      payment_status: 'paid'
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testOrder)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Order created successfully!');
      console.log('📦 Order ID:', result[0].id, 'Customer:', result[0].customer_name);
    } else {
      const error = await response.text();
      console.log('❌ Order creation failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test creating a customer
  console.log('\n📝 Creating test customer...');
  try {
    const testCustomer = {
      phone: '8888888888',
      name: 'RLS Test Customer',
      email: 'rlstest@example.com',
      cart_data: JSON.stringify([
        { id: 1, name: 'Test Product', price: 25, quantity: 1 }
      ])
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testCustomer)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Customer created successfully!');
      console.log('📦 Customer ID:', result[0].id, 'Name:', result[0].name);
    } else {
      const error = await response.text();
      console.log('❌ Customer creation failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🎉 All tests completed!');
  console.log('💡 If all tests passed, your Supabase data saving is now working!');
}

testAfterRLSFix();