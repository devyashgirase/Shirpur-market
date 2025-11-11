// Test Supabase Connection and Data
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase Connection...');
  
  try {
    // Test 1: Check products table
    const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products table:', products.length, 'products found');
      console.log('📦 Sample product:', products[0]?.name);
    } else {
      console.log('❌ Products table error:', productsResponse.status);
    }

    // Test 2: Check customers table
    const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (customersResponse.ok) {
      const customers = await customersResponse.json();
      console.log('✅ Customers table:', customers.length, 'customers found');
      console.log('👤 Sample customer:', customers[0]?.name);
    } else {
      console.log('❌ Customers table error:', customersResponse.status);
    }

    // Test 3: Check orders table
    const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log('✅ Orders table:', orders.length, 'orders found');
      console.log('📋 Sample order status:', orders[0]?.status);
    } else {
      console.log('❌ Orders table error:', ordersResponse.status);
    }

    // Test 4: Test data insertion
    console.log('\n🔄 Testing data insertion...');
    const testProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category: 'test',
      stock_quantity: 10
    };

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testProduct)
    });

    if (insertResponse.ok) {
      const insertedProduct = await insertResponse.json();
      console.log('✅ Data insertion successful:', insertedProduct[0]?.name);
      
      // Clean up test data
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${insertedProduct[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log('🧹 Test data cleaned up');
    } else {
      console.log('❌ Data insertion failed:', insertResponse.status);
      const error = await insertResponse.text();
      console.log('Error details:', error);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

// Run the test
testSupabaseConnection();