// Check what records exist in Supabase database
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

async function checkRecords() {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Check products
    console.log('📦 PRODUCTS TABLE:');
    const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, { headers });
    const products = await productsResponse.json();
    console.log(`Found ${products.length} products:`);
    products.forEach(p => console.log(`- ID: ${p.id}, Name: ${p.name}, Price: ₹${p.price}`));

    // Check orders  
    console.log('\n📋 ORDERS TABLE:');
    const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, { headers });
    const orders = await ordersResponse.json();
    console.log(`Found ${orders.length} orders:`);
    orders.forEach(o => console.log(`- ID: ${o.id}, Customer: ${o.customer_name}, Total: ₹${o.total_amount}`));

    // Check delivery agents
    console.log('\n🚚 DELIVERY AGENTS TABLE:');
    const agentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/delivery_agents`, { headers });
    const agents = await agentsResponse.json();
    console.log(`Found ${agents.length} delivery agents:`);
    agents.forEach(a => console.log(`- ID: ${a.id}, Name: ${a.name}, UserID: ${a.userid}`));

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkRecords();