// Test cart with minimal fields
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testSimpleCart() {
  try {
    console.log('🧪 Testing simple cart item...');
    
    const testCartItem = {
      user_phone: '9876543210',
      product_id: 1,
      quantity: 2
    };
    
    console.log('📤 Adding to cart:', testCartItem);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testCartItem)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cart item added:', result);
      
      // Check cart contents
      console.log('\n🔍 Checking cart contents...');
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      const carts = await checkResponse.json();
      console.log(`📋 Total cart items: ${carts.length}`);
      carts.forEach(c => console.log(`- User: ${c.user_phone}, Product: ${c.product_id}, Qty: ${c.quantity}`));
      
    } else {
      const error = await response.text();
      console.error('❌ Failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSimpleCart();