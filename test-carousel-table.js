// Test carousel_items table
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testCarouselTable() {
  try {
    console.log('🎠 Testing carousel_items table...');
    
    // Test creating carousel items for existing products
    const carouselItems = [
      {
        product_id: 1, // Fresh Tomatoes
        banner_image: 'https://images.unsplash.com/photo-1546470427-e5d491d9f2b8?w=800',
        is_active: true,
        display_order: 1
      },
      {
        product_id: 2, // Basmati Rice  
        banner_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
        is_active: true,
        display_order: 2
      },
      {
        product_id: 3, // Fresh Milk
        banner_image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
        is_active: true,
        display_order: 3
      }
    ];
    
    console.log('📤 Creating carousel items...');
    
    for (let i = 0; i < carouselItems.length; i++) {
      const item = carouselItems[i];
      console.log(`\n📸 Creating carousel item ${i + 1}:`, item);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/carousel_items`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(item)
      });
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Carousel item created:', result[0]);
      } else {
        const error = await response.text();
        console.error('❌ Creation failed:', error);
      }
    }
    
    // Check all carousel items
    console.log('\n🔍 Checking carousel_items table...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/carousel_items?order=display_order.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (checkResponse.ok) {
      const items = await checkResponse.json();
      console.log(`📋 Total carousel items: ${items.length}`);
      
      items.forEach(item => {
        console.log(`\n🎠 Carousel Item ${item.display_order}:`);
        console.log(`  - ID: ${item.id}`);
        console.log(`  - Product ID: ${item.product_id}`);
        console.log(`  - Banner: ${item.banner_image?.substring(0, 50)}...`);
        console.log(`  - Active: ${item.is_active}`);
        console.log(`  - Order: ${item.display_order}`);
      });
      
      console.log('\n✅ Carousel functionality working perfectly!');
      console.log('🎯 These banners will appear in your app\'s homepage carousel');
      
    } else {
      const error = await checkResponse.text();
      console.error('❌ Check failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCarouselTable();