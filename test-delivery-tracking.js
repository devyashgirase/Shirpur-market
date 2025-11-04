// Test delivery tracking table
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testDeliveryTracking() {
  try {
    console.log('🧪 Testing delivery tracking table...');
    
    const testTrackingData = [
      {
        agent_id: 'DA123456',
        order_id: 'ORD1762270469090',
        latitude: 21.3099,
        longitude: 74.7777,
        accuracy: 10.5,
        status: 'active'
      },
      {
        agent_id: 'DA123456',
        order_id: 'ORD1762270469090',
        latitude: 21.3105,
        longitude: 74.7780,
        accuracy: 8.2,
        status: 'active'
      },
      {
        agent_id: 'DA415944',
        order_id: null,
        latitude: 21.3120,
        longitude: 74.7790,
        accuracy: 12.1,
        status: 'active'
      }
    ];
    
    console.log('📤 Creating tracking records...');
    
    for (const trackingData of testTrackingData) {
      console.log(`\n📍 Creating tracking record for agent: ${trackingData.agent_id}`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/delivery_tracking`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(trackingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Tracking record created:', result[0]);
      } else {
        const error = await response.text();
        console.error('❌ Tracking creation failed:', error);
      }
    }
    
    // Check all tracking records
    console.log('\n🔍 Checking delivery_tracking table...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/delivery_tracking?order=timestamp.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      const trackingRecords = await checkResponse.json();
      console.log(`📋 Total tracking records: ${trackingRecords.length}`);
      trackingRecords.forEach(record => {
        console.log(`- Agent: ${record.agent_id}, Order: ${record.order_id || 'N/A'}, Location: ${record.latitude}, ${record.longitude}, Time: ${new Date(record.timestamp).toLocaleString()}`);
      });
    } else {
      console.error('❌ Failed to fetch tracking records');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDeliveryTracking();