// Database Setup and Verification for Real Tables
import { supabase, supabaseApi, testConnection, verifyDatabaseTables } from './supabase';

export class DatabaseSetup {
  static async verifyAndSetupDatabase() {
    console.log('🔍 Starting database verification...');
    
    if (!supabase) {
      console.error('❌ Database Setup Failed: Supabase not configured');
      console.log('📋 Required Steps:');
      console.log('1. Create Supabase project at https://supabase.com');
      console.log('2. Get your project URL and API key');
      console.log('3. Update .env file with real credentials');
      console.log('4. Run supabase-schema.sql in Supabase SQL editor');
      return false;
    }

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      return false;
    }

    // Verify tables exist
    const tablesValid = await verifyDatabaseTables();
    if (!tablesValid) {
      console.error('❌ Database tables missing or invalid');
      console.log('📋 Run supabase-schema.sql in your Supabase SQL editor');
      return false;
    }

    console.log('✅ Database setup verified successfully');
    return true;
  }

  static async insertSampleData() {
    if (!supabase) return false;

    try {
      console.log('📊 Checking for existing data...');
      
      // Check if products exist
      const existingProducts = await supabaseApi.getProducts();
      if (existingProducts.length === 0) {
        console.log('💾 Inserting sample products...');
        
        const sampleProducts = [
          {
            name: 'Basmati Rice Premium',
            description: 'Premium quality aged basmati rice',
            price: 120.00,
            category: 'Grains',
            stockQuantity: 50,
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            isActive: true
          },
          {
            name: 'Toor Dal',
            description: 'Fresh toor dal from Maharashtra',
            price: 85.00,
            category: 'Pulses',
            stockQuantity: 30,
            imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400',
            isActive: true
          },
          {
            name: 'Sunflower Oil',
            description: 'Pure sunflower cooking oil',
            price: 150.00,
            category: 'Oil',
            stockQuantity: 25,
            imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
            isActive: true
          },
          {
            name: 'Fresh Milk',
            description: 'Farm fresh full cream milk',
            price: 28.00,
            category: 'Dairy',
            stockQuantity: 100,
            imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
            isActive: true
          },
          {
            name: 'Red Onions',
            description: 'Fresh red onions from Nashik',
            price: 35.00,
            category: 'Vegetables',
            stockQuantity: 40,
            imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
            isActive: true
          },
          {
            name: 'Bananas',
            description: 'Fresh ripe bananas',
            price: 60.00,
            category: 'Fruits',
            stockQuantity: 20,
            imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
            isActive: true
          }
        ];

        for (const product of sampleProducts) {
          await supabaseApi.createProduct(product);
        }
        
        console.log('✅ Sample products inserted successfully');
      } else {
        console.log(`✅ Found ${existingProducts.length} existing products`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error inserting sample data:', error);
      return false;
    }
  }

  static async testDataFlow() {
    console.log('🧪 Testing complete data flow...');
    
    try {
      // Test 1: Create a test product
      console.log('1️⃣ Testing product creation...');
      const testProduct = await supabaseApi.createProduct({
        name: 'Test Product',
        description: 'Test product for data flow verification',
        price: 99.99,
        category: 'Test',
        stockQuantity: 10,
        imageUrl: 'https://via.placeholder.com/400',
        isActive: true
      });

      if (!testProduct) {
        console.error('❌ Product creation failed');
        return false;
      }
      console.log('✅ Product created with ID:', testProduct.id);

      // Test 2: Update product status
      console.log('2️⃣ Testing product update...');
      const updatedProduct = await supabaseApi.updateProduct(testProduct.id, {
        isActive: false
      });

      if (!updatedProduct) {
        console.error('❌ Product update failed');
        return false;
      }
      console.log('✅ Product status updated');

      // Test 3: Create a test order
      console.log('3️⃣ Testing order creation...');
      const testOrder = await supabaseApi.createOrder({
        customerName: 'Test Customer',
        customerPhone: '+919999999999',
        deliveryAddress: 'Test Address, Shirpur',
        total: 199.98,
        status: 'confirmed',
        paymentStatus: 'paid',
        items: [
          {
            productId: testProduct.id,
            productName: testProduct.name,
            price: testProduct.price,
            quantity: 2
          }
        ]
      });

      if (!testOrder) {
        console.error('❌ Order creation failed');
        return false;
      }
      console.log('✅ Order created with ID:', testOrder.id);

      // Test 4: Update order status
      console.log('4️⃣ Testing order status update...');
      const statusUpdated = await supabaseApi.updateOrderStatus(testOrder.id, 'packing');
      
      if (!statusUpdated) {
        console.error('❌ Order status update failed');
        return false;
      }
      console.log('✅ Order status updated to packing');

      // Test 5: Fetch all data
      console.log('5️⃣ Testing data retrieval...');
      const products = await supabaseApi.getProducts();
      const orders = await supabaseApi.getOrders();
      
      console.log(`✅ Retrieved ${products.length} products and ${orders.length} orders`);

      console.log('🎉 All data flow tests passed successfully!');
      console.log('📊 Database is ready for production use');
      
      return true;
    } catch (error) {
      console.error('❌ Data flow test failed:', error);
      return false;
    }
  }

  static async runCompleteSetup() {
    console.log('🚀 Running complete database setup...');
    
    // Step 1: Verify database
    const dbReady = await this.verifyAndSetupDatabase();
    if (!dbReady) {
      return false;
    }

    // Step 2: Insert sample data
    await this.insertSampleData();

    // Step 3: Test data flow
    const flowTest = await this.testDataFlow();
    
    if (flowTest) {
      console.log('🎉 Database setup completed successfully!');
      console.log('✅ All data will now flow to real database tables');
      console.log('📊 Ready for production use');
    }
    
    return flowTest;
  }
}

// Auto-run setup on import (only in development)
if (import.meta.env.DEV) {
  DatabaseSetup.verifyAndSetupDatabase().then(ready => {
    if (ready) {
      console.log('🚀 Database ready for real-time operations');
    }
  });
}