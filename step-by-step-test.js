// Step by step data insertion test
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function stepByStepTest() {
  console.log('🔄 Step by Step Data Insertion Test\n');

  // Step 1: Insert Product
  console.log('📦 STEP 1: Inserting Product...');
  try {
    const product = {
      name: 'Step Test Product',
      description: 'Product for step test',
      price: 45.00,
      category: 'vegetables',
      stock_quantity: 50,
      image_url: '/placeholder.svg',
      is_active: true,
      sku: 'STEP' + Date.now(),
      unit: 'kg'
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product inserted! ID:', result[0].id);
      console.log('📋 Check products table in Supabase now\n');
      return result[0].id;
    } else {
      console.log('❌ Product failed:', await response.text());
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Run the test
stepByStepTest();