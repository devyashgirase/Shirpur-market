// Check admin orders data
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function checkAdminOrders() {
  try {
    console.log('🔍 Checking admin orders data...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      const orders = await response.json();
      console.log(`📊 Total orders in database: ${orders.length}`);
      
      if (orders.length > 0) {
        console.log('\n📋 Recent orders:');
        orders.slice(0, 10).forEach((order, index) => {
          console.log(`${index + 1}. Order: ${order.order_id}`);
          console.log(`   Customer: ${order.customer_name} (${order.customer_phone})`);
          console.log(`   Total: ₹${order.total_amount}`);
          console.log(`   Status: ${order.order_status}`);
          console.log(`   Payment: ${order.payment_status}`);
          console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
          console.log('   ---');
        });
        
        // Check today's orders
        const today = new Date().toDateString();
        const todaysOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
        console.log(`\n📅 Today's orders: ${todaysOrders.length}`);
        
        // Calculate revenue
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        console.log(`💰 Total revenue: ₹${totalRevenue}`);
        console.log(`💰 Today's revenue: ₹${todaysRevenue}`);
        
      } else {
        console.log('⚠️ No orders found in database');
      }
    } else {
      console.error('❌ Failed to fetch orders:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  }
}

checkAdminOrders();