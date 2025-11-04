// Test customers table in Supabase
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testCustomersTable() {
  try {
    console.log('🧪 Testing customers table...');
    
    const testCustomer = {
      phone: `91${Date.now().toString().slice(-8)}`,
      name: 'Active File Test User',
      email: 'activefile@test.com',
      cart_data: JSON.stringify([
        { id: 1, name: 'Fresh Tomatoes', price: 40, quantity: 2 },
        { id: 2, name: 'Basmati Rice', price: 120, quantity: 1 }
      ])
    };
    
    console.log('📤 Creating customer:', testCustomer);
    
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
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Customer created successfully:', result);
      
      // Check all customers in database
      console.log('\n🔍 Checking customers table...');
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      const customers = await checkResponse.json();
      console.log(`📋 Total customers in database: ${customers.length}`);
      customers.forEach(c => {
        const cartItems = JSON.parse(c.cart_data || '[]').length;
        console.log(`- ID: ${c.id}, Phone: ${c.phone}, Name: ${c.name}, Cart: ${cartItems} items`);
      });
      
    } else {
      const error = await response.text();
      console.error('❌ Customer creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomersTable();