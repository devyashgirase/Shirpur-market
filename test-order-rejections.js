// Test order_rejections table in Supabase
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testOrderRejectionsTable() {
  try {
    console.log('🧪 Testing order_rejections table...');
    
    const testRejections = [
      {
        order_id: `ORD${Date.now()}`,
        agent_id: 'AGENT001',
        reason: 'Customer not available at delivery address'
      },
      {
        order_id: `ORD${Date.now() + 1}`,
        agent_id: 'AGENT002',
        reason: 'Vehicle breakdown - unable to deliver'
      },
      {
        order_id: `ORD${Date.now() + 2}`,
        agent_id: 'AGENT001',
        reason: null
      }
    ];
    
    console.log('📤 Creating order rejections...');
    
    for (const rejection of testRejections) {
      console.log(`\n❌ Creating rejection for order: ${rejection.order_id}`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/order_rejections`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(rejection)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Rejection created:', result[0]);
      } else {
        const error = await response.text();
        console.error('❌ Rejection creation failed:', error);
      }
    }
    
    // Check all rejections in database
    console.log('\n🔍 Checking order_rejections table...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_rejections`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      const rejections = await checkResponse.json();
      console.log(`📋 Total rejections in database: ${rejections.length}`);
      rejections.forEach(r => {
        console.log(`- ID: ${r.id}, Order: ${r.order_id}, Agent: ${r.agent_id}, Reason: ${r.reason || 'No reason provided'}`);
      });
    } else {
      console.error('❌ Failed to fetch rejections');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOrderRejectionsTable();