// Test data saving to Supabase
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testOrderSave() {
  console.log('🧪 Testing order save to Supabase...');
  
  const testOrder = {
    order_id: `TEST-${Date.now()}`,
    customer_name: 'Test Customer',
    customer_phone: '9876543210',
    customer_address: 'Test Address, Shirpur',
    items: JSON.stringify([
      { id: 1, name: 'Test Product', quantity: 2, price: 50 }
    ]),
    total_amount: 100,
    payment_status: 'paid',
    order_status: 'confirmed'
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
      body: JSON.stringify(testOrder)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Order saved successfully!');
      console.log('📦 Saved order:', result);
      
      // Now fetch to verify
      const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?order_id=eq.${testOrder.order_id}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (fetchResponse.ok) {
        const fetchedOrder = await fetchResponse.json();
        console.log('✅ Order verified in database:', fetchedOrder);
      }
    } else {
      const error = await response.text();
      console.log('❌ Save failed:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testOrderSave();