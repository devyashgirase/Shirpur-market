// Test Supabase connection
const supabaseUrl = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
    } else {
      console.log('❌ Supabase connection failed');
      const text = await response.text();
      console.log('Error response:', text);
    }
  } catch (error) {
    console.log('❌ Connection error:', error);
  }
}

testConnection();