// Check orders table structure
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function checkTableStructure() {
  try {
    // Try to get table info by making a request with select=*
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?limit=0`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response headers:');
    for (let [key, value] of response.headers.entries()) {
      if (key.includes('content') || key.includes('schema')) {
        console.log(`${key}: ${value}`);
      }
    }
    
    // Try creating order without delivery_address
    console.log('\n🧪 Testing order creation without delivery_address...');
    
    const testOrder = {
      order_id: `ORD${Date.now()}`,
      customer_name: 'Test Customer',
      customer_phone: '9876543210', 
      customer_address: 'Test Address, Shirpur',
      items: JSON.stringify([
        { id: 1, name: 'Fresh Tomatoes', price: 40, quantity: 2 }
      ]),
      total_amount: 80,
      order_status: 'confirmed',
      payment_status: 'paid'
    };
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testOrder)
    });
    
    console.log('📊 Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Order created successfully:', result);
    } else {
      const error = await createResponse.text();
      console.error('❌ Still failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTableStructure();