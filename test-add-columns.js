// Test adding location columns to delivery_agents table
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function addLocationColumns() {
  try {
    console.log('🔧 Adding location columns to delivery_agents table...');
    
    // First check current table structure
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/delivery_agents?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      const agents = await checkResponse.json();
      console.log('📋 Current table structure:', Object.keys(agents[0] || {}));
    }
    
    // Try to update an agent with location data to test if columns exist
    const testUpdate = await fetch(`${SUPABASE_URL}/rest/v1/delivery_agents?id=eq.1`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_lat: 21.3099,
        current_lng: 75.1178
      })
    });
    
    console.log('📊 Update test status:', testUpdate.status);
    
    if (testUpdate.ok) {
      console.log('✅ Location columns already exist and working!');
    } else {
      const error = await testUpdate.text();
      console.log('❌ Columns missing, error:', error);
      console.log('📝 Please run the SQL script in Supabase SQL Editor:');
      console.log(`
ALTER TABLE delivery_agents 
ADD COLUMN current_lat DECIMAL(10, 8),
ADD COLUMN current_lng DECIMAL(11, 8),
ADD COLUMN last_location_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

addLocationColumns();