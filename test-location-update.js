// Test location update functionality
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testLocationUpdate() {
  try {
    console.log('📍 Testing location update...');
    
    // Test updating location for agent ID 1
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/delivery_agents?id=eq.1`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_lat: 21.3099,
        current_lng: 75.1178,
        last_location_update: new Date().toISOString()
      })
    });
    
    console.log('📊 Update status:', updateResponse.status);
    
    if (updateResponse.ok) {
      console.log('✅ Location updated successfully!');
      
      // Verify the update
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/delivery_agents?id=eq.1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      const agents = await checkResponse.json();
      if (agents[0]) {
        console.log('📍 Current location:', {
          lat: agents[0].current_lat,
          lng: agents[0].current_lng,
          updated: agents[0].last_location_update
        });
      }
    } else {
      const error = await updateResponse.text();
      console.error('❌ Update failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLocationUpdate();