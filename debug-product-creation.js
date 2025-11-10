// Debug script to test product creation from website
console.log('🧪 Testing product creation flow...');

// Test 1: Check environment variables
console.log('📋 Environment Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Test 2: Test supabaseApi directly
const testSupabaseApi = async () => {
  try {
    console.log('\n📦 Testing supabaseApi.createProduct...');
    
    // Import the supabaseApi
    const { supabaseApi } = await import('./src/lib/supabase.js');
    
    const testProduct = {
      name: `Debug Test Product ${Date.now()}`,
      description: 'Test product from debug script',
      price: 75.99,
      category: 'test',
      stockQuantity: 25,
      imageUrl: '/placeholder.svg',
      isActive: true
    };
    
    console.log('📤 Sending product data:', testProduct);
    
    const result = await supabaseApi.createProduct(testProduct);
    console.log('✅ Product created successfully:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Product creation failed:', error);
    return false;
  }
};

// Test 3: Test unifiedDB
const testUnifiedDB = async () => {
  try {
    console.log('\n🔗 Testing unifiedDB.createProduct...');
    
    const { unifiedDB } = await import('./src/lib/database.js');
    
    const testProduct = {
      name: `UnifiedDB Test Product ${Date.now()}`,
      description: 'Test product from unifiedDB',
      price: 85.99,
      category: 'test',
      stockQuantity: 30,
      imageUrl: '/placeholder.svg',
      isActive: true
    };
    
    console.log('📤 Sending via unifiedDB:', testProduct);
    
    const result = await unifiedDB.createProduct(testProduct);
    console.log('✅ UnifiedDB product created:', result);
    
    return true;
  } catch (error) {
    console.error('❌ UnifiedDB creation failed:', error);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('\n🚀 Starting debug tests...\n');
  
  const test1 = await testSupabaseApi();
  const test2 = await testUnifiedDB();
  
  console.log('\n📊 Test Results:');
  console.log('- supabaseApi.createProduct:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('- unifiedDB.createProduct:', test2 ? '✅ PASS' : '❌ FAIL');
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Product creation should work from website.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
};

runTests().catch(console.error);