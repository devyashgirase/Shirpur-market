// Test cart operations in Supabase
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testCartOperations() {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Check if user_carts table exists
    console.log('🛒 Checking user_carts table...');
    
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts?limit=1`, { headers });
    console.log('📊 Table check status:', checkResponse.status);
    
    if (checkResponse.status === 404) {
      console.log('❌ user_carts table does not exist');
      return;
    }
    
    // Get existing cart data
    const cartsResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, { headers });
    const carts = await cartsResponse.json();
    console.log(`📋 Found ${carts.length} cart records:`);
    carts.forEach(c => console.log(`- User: ${c.user_phone}, Product: ${c.product_id}, Qty: ${c.quantity}`));
    
    // Test adding item to cart
    console.log('\n🧪 Testing cart item creation...');
    
    const testCartItem = {
      user_phone: '9876543210',
      product_id: 1,
      quantity: 2,
      added_at: new Date().toISOString()
    };
    
    console.log('📤 Adding to cart:', testCartItem);
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testCartItem)
    });
    
    console.log('📊 Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Cart item added successfully:', result);
      
      // Check updated cart
      console.log('\n🔍 Checking updated cart...');
      const updatedResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, { headers });
      const updatedCarts = await updatedResponse.json();
      console.log(`📋 Total cart items: ${updatedCarts.length}`);
      
    } else {
      const error = await createResponse.text();
      console.error('❌ Cart creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCartOperations();