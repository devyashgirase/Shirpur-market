// Test Supabase connection
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if tables exist
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful! Found', data.length, 'products');
    } else {
      const error = await response.text();
      console.error('❌ Connection failed:', error);
    }
    
    // Test 2: Try to create a test record
    console.log('\n🧪 Testing record creation...');
    
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Test',
      stock_quantity: 10,
      is_active: true,
      sku: `TEST${Date.now()}`,
      unit: 'kg'
    };
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testProduct)
    });
    
    console.log('📝 Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ Record created successfully:', created);
    } else {
      const createError = await createResponse.text();
      console.error('❌ Create failed:', createError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();