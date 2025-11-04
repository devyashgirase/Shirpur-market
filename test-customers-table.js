// Test customers table creation and data insertion
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testCustomersTable() {
  try {
    console.log('🧪 Testing customers table...');
    
    const testCustomers = [
      {
        phone: '9876543210',
        name: 'Rajesh Sharma',
        email: 'rajesh@example.com',
        cart_data: JSON.stringify([
          { id: 1, name: 'Fresh Tomatoes', price: 40, quantity: 2 }
        ])
      },
      {
        phone: '8765432109',
        name: 'Priya Patel',
        email: 'priya@example.com',
        cart_data: '[]'
      },
      {
        phone: '7654321098',
        name: 'Amit Kumar',
        email: null,
        cart_data: JSON.stringify([
          { id: 2, name: 'Basmati Rice', price: 120, quantity: 1 },
          { id: 3, name: 'Fresh Milk', price: 60, quantity: 2 }
        ])
      }
    ];
    
    console.log('📤 Creating customers...');
    
    for (const customer of testCustomers) {
      console.log(`\n👤 Creating customer: ${customer.name} (${customer.phone})`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(customer)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer created:', result[0]);
      } else {
        const error = await response.text();
        console.error('❌ Customer creation failed:', error);
      }
    }
    
    // Check all customers in database
    console.log('\n🔍 Checking customers table...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      const customers = await checkResponse.json();
      console.log(`📋 Total customers in database: ${customers.length}`);
      customers.forEach(c => {
        const cartItems = JSON.parse(c.cart_data || '[]').length;
        console.log(`- ID: ${c.id}, Name: ${c.name}, Phone: ${c.phone}, Email: ${c.email || 'N/A'}, Cart Items: ${cartItems}`);
      });
    } else {
      console.error('❌ Failed to fetch customers');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomersTable();