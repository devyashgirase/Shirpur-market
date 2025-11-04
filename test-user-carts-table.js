// Test user_carts table with correct structure
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testUserCartsTable() {
  try {
    console.log('🛒 Testing user_carts table with correct structure...');
    
    const userPhone = '9876543210';
    const cartData = [
      {
        id: Date.now(),
        product: {
          id: '1',
          name: 'Fresh Tomatoes',
          price: 40,
          image_url: '/placeholder.svg'
        },
        quantity: 3,
        added_at: new Date().toISOString()
      },
      {
        id: Date.now() + 1,
        product: {
          id: '2', 
          name: 'Basmati Rice',
          price: 120,
          image_url: '/placeholder.svg'
        },
        quantity: 1,
        added_at: new Date().toISOString()
      }
    ];
    
    const testCartRecord = {
      user_phone: userPhone,
      cart_data: JSON.stringify(cartData)
    };
    
    console.log('📤 Creating cart record:', testCartRecord);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testCartRecord)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cart record created successfully:', result);
      
      // Check cart contents
      console.log('\n🔍 Checking user_carts table...');
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_carts`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      const carts = await checkResponse.json();
      console.log(`📋 Total cart records: ${carts.length}`);
      
      carts.forEach(cart => {
        console.log(`\n👤 User: ${cart.user_phone}`);
        const items = JSON.parse(cart.cart_data);
        console.log(`📦 Items in cart: ${items.length}`);
        items.forEach(item => {
          console.log(`  - ${item.product.name}: ${item.quantity} x ₹${item.product.price}`);
        });
        
        const total = items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
        console.log(`💰 Cart total: ₹${total}`);
      });
      
    } else {
      const error = await response.text();
      console.error('❌ Cart creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserCartsTable();