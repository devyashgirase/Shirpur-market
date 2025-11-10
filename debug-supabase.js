// Debug Supabase connection
console.log('🔍 Checking Supabase configuration...');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ftexuxkdfahbqjddidaf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

console.log('📊 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key:', supabaseKey ? 'Present' : 'Missing');

// Test connection
async function testConnection() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Supabase connection successful!');
      console.log('📦 Sample data:', data);
    } else {
      const error = await response.text();
      console.log('❌ Supabase connection failed:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testConnection();