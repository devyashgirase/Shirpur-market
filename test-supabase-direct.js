// Direct test of Supabase products table
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function testSupabase() {
  console.log('🧪 Testing Supabase products table...\n');
  
  try {
    // 1. Check existing products
    console.log('📋 Step 1: Checking existing products...');
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc&limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (getResponse.ok) {
      const products = await getResponse.json();
      console.log(`✅ Found ${products.length} products in database`);
      
      if (products.length > 0) {
        console.log('📦 Latest products:');
        products.forEach((p, i) => {
          console.log(`${i+1}. ID: ${p.id}, Name: "${p.name}", Created: ${p.created_at}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch products:', getResponse.status);
    }
    
    // 2. Create a new test product
    console.log('\n📝 Step 2: Creating new test product...');
    const testProduct = {
      name: `Direct Test Product ${Date.now()}`,
      description: 'Created via direct API test',
      price: 199.99,
      category: 'test',
      stock_quantity: 15,
      image_url: '/placeholder.svg',
      is_active: true,
      sku: `DIRECT${Date.now()}`,
      unit: 'kg'
    };
    
    console.log('📤 Product data:', JSON.stringify(testProduct, null, 2));
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testProduct)
    });
    
    console.log('📊 Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ Product created successfully!');
      console.log('📦 Created product:', JSON.stringify(created[0], null, 2));
      
      // 3. Verify it was saved
      console.log('\n🔍 Step 3: Verifying product was saved...');
      const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${created[0].id}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (verifyResponse.ok) {
        const verified = await verifyResponse.json();
        if (verified.length > 0) {
          console.log('✅ Product verified in database!');
          console.log('📋 Verified data:', verified[0]);
        } else {
          console.log('❌ Product not found after creation!');
        }
      }
      
    } else {
      const error = await createResponse.text();
      console.log('❌ Product creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabase();