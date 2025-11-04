// Test cart using app's actual cart service
import { supabaseApi } from './src/lib/supabase.js';

async function testAppCart() {
  try {
    console.log('🛒 Testing app cart functionality...');
    
    const userPhone = '9876543210';
    const productId = '1'; // Fresh Tomatoes
    const quantity = 3;
    
    console.log(`📤 Adding product ${productId} (qty: ${quantity}) to cart for user: ${userPhone}`);
    
    // Test add to cart
    const cart = await supabaseApi.addToCart(userPhone, productId, quantity);
    console.log('✅ Cart after adding item:', cart);
    
    // Test get cart
    console.log('\n🔍 Getting cart contents...');
    const cartContents = await supabaseApi.getCart(userPhone);
    console.log('📋 Current cart:', cartContents);
    
    // Test update quantity
    console.log('\n🔄 Updating quantity to 5...');
    const updatedCart = await supabaseApi.updateCartQuantity(userPhone, productId, 5);
    console.log('✅ Cart after update:', updatedCart);
    
    // Test add another product
    console.log('\n➕ Adding another product (Basmati Rice)...');
    const cartWithTwo = await supabaseApi.addToCart(userPhone, '2', 1);
    console.log('✅ Cart with two products:', cartWithTwo);
    
    console.log('\n📊 Final cart summary:');
    cartWithTwo.forEach(item => {
      console.log(`- ${item.product.name}: ${item.quantity} x ₹${item.product.price} = ₹${item.quantity * item.product.price}`);
    });
    
    const total = cartWithTwo.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
    console.log(`💰 Total: ₹${total}`);
    
  } catch (error) {
    console.error('❌ Cart test failed:', error);
  }
}

testAppCart();