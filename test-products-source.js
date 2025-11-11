// Test where products are coming from
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testProductsSource() {
  console.log('🔍 Testing products source...');
  
  try {
    // Test 1: Direct Supabase API call
    console.log('\n1. Testing direct Supabase products table:');
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (supabaseResponse.ok) {
      const supabaseProducts = await supabaseResponse.json();
      console.log('✅ Supabase products table:', supabaseProducts.length, 'products');
      console.log('📦 Sample product:', supabaseProducts[0]);
    } else {
      console.log('❌ Supabase products table error:', supabaseResponse.status);
    }

    // Test 2: Check if using mock data
    console.log('\n2. Testing mock data fallback:');
    const mockProducts = [
      { id: 1, name: 'Fresh Tomatoes', price: 40, category: 'Vegetables', stockQuantity: 100, isActive: true },
      { id: 2, name: 'Basmati Rice', price: 120, category: 'Grains', stockQuantity: 50, isActive: true },
      { id: 3, name: 'Organic Milk', price: 60, category: 'Dairy', stockQuantity: 30, isActive: true }
    ];
    console.log('📋 Mock products available:', mockProducts.length);

    // Test 3: Check localStorage cache
    console.log('\n3. Testing localStorage cache:');
    const cachedProducts = localStorage.getItem('availableProducts');
    if (cachedProducts) {
      const parsed = JSON.parse(cachedProducts);
      console.log('💾 Cached products:', parsed.data ? parsed.data.length : parsed.length);
    } else {
      console.log('💾 No cached products found');
    }

    // Test 4: Check environment variables
    console.log('\n4. Environment check:');
    console.log('🌍 Current hostname:', window.location.hostname);
    console.log('🔧 Development mode:', window.location.hostname === 'localhost');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductsSource();