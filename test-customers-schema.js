// Test customers table schema and constraints
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testCustomersSchema() {
  try {
    console.log('🧪 Testing customers table schema...');
    
    // Test 1: Create new customer with unique phone
    const newCustomer = {
      phone: `98${Date.now().toString().slice(-8)}`, // Unique phone
      name: 'Schema Test User',
      email: 'test@schema.com',
      cart_data: JSON.stringify([{ id: 1, name: 'Test Item', price: 50, quantity: 1 }])
    };
    
    console.log('📤 Creating new customer:', newCustomer.phone);
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newCustomer)
    });
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Customer created:', result[0]);
      
      // Test 2: Try duplicate phone (should fail)
      console.log('\n🔄 Testing unique constraint...');
      const duplicateResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: newCustomer.phone,
          name: 'Duplicate Test',
          email: 'duplicate@test.com'
        })
      });
      
      if (!duplicateResponse.ok) {
        const error = await duplicateResponse.json();
        console.log('✅ Unique constraint working:', error.message);
      }
      
    } else {
      const error = await createResponse.text();
      console.error('❌ Customer creation failed:', error);
    }
    
    // Test 3: Check all customers
    console.log('\n🔍 Checking all customers...');
    const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const customers = await allResponse.json();
    console.log(`📋 Total customers: ${customers.length}`);
    customers.forEach(c => {
      const cartItems = JSON.parse(c.cart_data || '[]').length;
      console.log(`- ID: ${c.id}, Phone: ${c.phone}, Name: ${c.name}, Cart: ${cartItems} items`);
    });
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  }
}

testCustomersSchema();