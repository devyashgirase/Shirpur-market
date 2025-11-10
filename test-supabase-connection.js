// Test Supabase connection and data saving
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection and data operations...\n');

  // Test 1: Check if we can read existing data
  console.log('📖 Test 1: Reading existing data');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Read successful - Products found:', products.length);
      console.log('📋 Sample products:', products.map(p => ({ id: p.id, name: p.name })));
    } else {
      console.log('❌ Read failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Read error:', error.message);
  }

  // Test 2: Try to create new product
  console.log('\n📝 Test 2: Creating new product');
  try {
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'Test product for connection verification',
      price: 99.99,
      category: 'test',
      stock_quantity: 10,
      image_url: '/placeholder.svg',
      is_active: true,
      sku: 'TEST' + Date.now(),
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

    console.log('📊 Create response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product created successfully:', result[0]);
    } else {
      const error = await response.text();
      console.log('❌ Create failed:', error);
    }
  } catch (error) {
    console.log('❌ Create error:', error.message);
  }

  // Test 3: Check orders table
  console.log('\n📦 Test 3: Checking orders table');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      const orders = await response.json();
      console.log('✅ Orders read successful - Orders found:', orders.length);
      console.log('📋 Sample orders:', orders.map(o => ({ id: o.id, customer_name: o.customer_name, total_amount: o.total_amount })));
    } else {
      console.log('❌ Orders read failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Orders read error:', error.message);
  }

  // Test 4: Try to create new order
  console.log('\n📝 Test 4: Creating new order');
  try {
    const testOrder = {
      order_id: 'TEST-' + Date.now(),
      customer_name: 'Test Customer',
      customer_phone: '9876543210',
      customer_address: 'Test Address, Test City',
      items: JSON.stringify([{ name: 'Test Item', quantity: 1, price: 50 }]),
      total_amount: 50,
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

    console.log('📊 Order create response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Order created successfully:', result[0]);
    } else {
      const error = await response.text();
      console.log('❌ Order create failed:', error);
    }
  } catch (error) {
    console.log('❌ Order create error:', error.message);
  }

  // Test 5: Check RLS (Row Level Security) status
  console.log('\n🔒 Test 5: Checking RLS status');
  try {
    // Try to insert without proper auth to see RLS response
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'RLS Test' })
    });

    if (response.status === 401) {
      console.log('🔒 RLS is enabled - this might be blocking inserts');
    } else {
      console.log('🔓 RLS status unclear - response:', response.status);
    }
  } catch (error) {
    console.log('❌ RLS test error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

testSupabaseConnection();