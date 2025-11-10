// Test website data saving functionality
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

console.log('🧪 Testing website data save functionality...\n');

// Test 1: Create a product (Admin operation)
async function testProductCreation() {
  console.log('📦 Test 1: Creating product from website...');
  
  const productData = {
    name: `Website Test Product ${Date.now()}`,
    description: 'Product created from website test',
    price: 75.50,
    category: 'test',
    stock_quantity: 25,
    image_url: '/placeholder.svg',
    is_active: true,
    sku: `WEB${Date.now()}`,
    unit: 'kg'
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(productData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product created successfully:', result[0]);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Product creation failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Test 2: Create an order (Customer operation)
async function testOrderCreation() {
  console.log('\n📝 Test 2: Creating order from website...');
  
  const orderData = {
    order_id: `WEB-${Date.now()}`,
    customer_name: 'Website Test Customer',
    customer_phone: '9876543210',
    customer_address: 'Test Address from Website',
    items: JSON.stringify([
      { name: 'Test Item', quantity: 2, price: 50 }
    ]),
    total_amount: 100,
    order_status: 'confirmed',
    payment_status: 'paid'
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Order created successfully:', result[0]);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Order creation failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Test 3: Update order status (Admin/Delivery operation)
async function testOrderUpdate() {
  console.log('\n🔄 Test 3: Updating order status...');
  
  // First get the latest order
  try {
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!getResponse.ok) {
      console.log('❌ Failed to fetch orders');
      return false;
    }
    
    const orders = await getResponse.json();
    if (orders.length === 0) {
      console.log('❌ No orders found to update');
      return false;
    }
    
    const orderId = orders[0].id;
    console.log('📋 Updating order ID:', orderId);
    
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_status: 'preparing',
        updated_at: new Date().toISOString()
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Order status updated successfully');
      return true;
    } else {
      const error = await updateResponse.text();
      console.log('❌ Order update failed:', updateResponse.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = {
    productCreation: await testProductCreation(),
    orderCreation: await testOrderCreation(),
    orderUpdate: await testOrderUpdate()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('- Product Creation:', results.productCreation ? '✅ PASS' : '❌ FAIL');
  console.log('- Order Creation:', results.orderCreation ? '✅ PASS' : '❌ FAIL');
  console.log('- Order Update:', results.orderUpdate ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Website data saving is working properly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above for details.');
  }
  
  return allPassed;
}

runTests().catch(console.error);