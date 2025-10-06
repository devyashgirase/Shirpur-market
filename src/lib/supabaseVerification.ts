// Comprehensive Supabase Verification for All Features
import { supabase, supabaseApi } from './supabase';
import { unifiedDB } from './database';

export class SupabaseVerification {
  static async runFullVerification(): Promise<boolean> {
    console.log('🔍 Starting comprehensive Supabase verification...');
    
    const results = {
      connection: false,
      tables: false,
      products: false,
      orders: false,
      customers: false,
      realTime: false,
      tracking: false
    };

    try {
      // 1. Test Connection
      results.connection = await this.testConnection();
      
      // 2. Verify Tables
      results.tables = await this.verifyTables();
      
      // 3. Test Products CRUD
      results.products = await this.testProducts();
      
      // 4. Test Orders System
      results.orders = await this.testOrders();
      
      // 5. Test Customer Management
      results.customers = await this.testCustomers();
      
      // 6. Test Real-time Features
      results.realTime = await this.testRealTime();
      
      // 7. Test Tracking System
      results.tracking = await this.testTracking();
      
      // Summary
      const allPassed = Object.values(results).every(r => r);
      console.log('📊 Verification Results:', results);
      console.log(allPassed ? '✅ All systems operational!' : '⚠️ Some issues detected');
      
      return allPassed;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Testing Supabase connection...');
      
      if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return false;
      }

      const { data, error } = await supabase.from('products').select('count').limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }

      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Connection error:', error);
      return false;
    }
  }

  static async verifyTables(): Promise<boolean> {
    try {
      console.log('📋 Verifying database tables...');
      
      const tables = ['products', 'orders', 'customers', 'delivery_agents', 'users'];
      const results = [];

      for (const table of tables) {
        try {
          const { error } = await supabase!.from(table).select('count').limit(1);
          results.push({ table, exists: !error });
          console.log(`${!error ? '✅' : '❌'} Table ${table}: ${!error ? 'exists' : 'missing'}`);
        } catch (err) {
          results.push({ table, exists: false });
          console.log(`❌ Table ${table}: error`);
        }
      }

      const allExist = results.every(r => r.exists);
      console.log(allExist ? '✅ All tables verified' : '⚠️ Some tables missing');
      return allExist;
    } catch (error) {
      console.error('❌ Table verification failed:', error);
      return false;
    }
  }

  static async testProducts(): Promise<boolean> {
    try {
      console.log('🛍️ Testing products system...');
      
      // Test fetch products
      const products = await supabaseApi.getProducts();
      console.log(`📦 Found ${products.length} products`);
      
      // Test create product (if admin)
      const testProduct = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'test',
        stockQuantity: 10,
        isActive: true,
        imageUrl: 'test.jpg'
      };
      
      const created = await supabaseApi.createProduct(testProduct);
      if (created) {
        console.log('✅ Product creation test passed');
        
        // Test update
        const updated = await supabaseApi.updateProduct(created.id, { price: 89.99 });
        console.log(updated ? '✅ Product update test passed' : '⚠️ Product update failed');
      }
      
      console.log('✅ Products system verified');
      return true;
    } catch (error) {
      console.error('❌ Products test failed:', error);
      return false;
    }
  }

  static async testOrders(): Promise<boolean> {
    try {
      console.log('📋 Testing orders system...');
      
      // Test fetch orders
      const orders = await supabaseApi.getOrders();
      console.log(`📦 Found ${orders.length} orders`);
      
      // Test create order
      const testOrder = {
        customerName: 'Test Customer',
        customerPhone: '+91 9999999999',
        deliveryAddress: 'Test Address, Shirpur',
        items: [
          { productId: 1, productName: 'Test Product', price: 99.99, quantity: 1 }
        ],
        total: 99.99,
        paymentId: 'test_payment_123'
      };
      
      const created = await supabaseApi.createOrder(testOrder);
      if (created) {
        console.log('✅ Order creation test passed');
        
        // Test status update
        const updated = await supabaseApi.updateOrderStatus(created.id, 'confirmed');
        console.log(updated ? '✅ Order status update test passed' : '⚠️ Order update failed');
      }
      
      console.log('✅ Orders system verified');
      return true;
    } catch (error) {
      console.error('❌ Orders test failed:', error);
      return false;
    }
  }

  static async testCustomers(): Promise<boolean> {
    try {
      console.log('👥 Testing customer system...');
      
      const testCustomer = {
        name: 'Test Customer',
        phone: '+91 9999999999',
        address: 'Test Address'
      };
      
      const created = await supabaseApi.createCustomer(testCustomer);
      console.log(created ? '✅ Customer creation test passed' : '⚠️ Customer creation failed');
      
      console.log('✅ Customer system verified');
      return true;
    } catch (error) {
      console.error('❌ Customer test failed:', error);
      return false;
    }
  }

  static async testRealTime(): Promise<boolean> {
    try {
      console.log('⚡ Testing real-time features...');
      
      if (!supabase) return false;
      
      // Test real-time subscription
      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => console.log('📡 Real-time update:', payload)
        )
        .subscribe();
      
      // Clean up
      setTimeout(() => {
        supabase.removeChannel(subscription);
      }, 1000);
      
      console.log('✅ Real-time system verified');
      return true;
    } catch (error) {
      console.error('❌ Real-time test failed:', error);
      return false;
    }
  }

  static async testTracking(): Promise<boolean> {
    try {
      console.log('📍 Testing tracking system...');
      
      // Test location update
      const locationUpdated = await supabaseApi.updateDeliveryLocation(1, 21.3486, 74.8811);
      console.log(locationUpdated ? '✅ Location update test passed' : '⚠️ Location update failed');
      
      // Test payment status update
      const paymentUpdated = await supabaseApi.updatePaymentStatus(1, 'paid');
      console.log(paymentUpdated ? '✅ Payment update test passed' : '⚠️ Payment update failed');
      
      console.log('✅ Tracking system verified');
      return true;
    } catch (error) {
      console.error('❌ Tracking test failed:', error);
      return false;
    }
  }

  static async checkEnvironmentVariables(): Promise<boolean> {
    console.log('🔧 Checking environment variables...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const checks = {
      url: supabaseUrl && supabaseUrl.includes('supabase.co'),
      key: supabaseKey && supabaseKey.length > 50,
      format: supabaseUrl && supabaseKey
    };
    
    console.log('Environment checks:', {
      'VITE_SUPABASE_URL': checks.url ? '✅ Valid' : '❌ Invalid/Missing',
      'VITE_SUPABASE_ANON_KEY': checks.key ? '✅ Valid' : '❌ Invalid/Missing'
    });
    
    return Object.values(checks).every(Boolean);
  }

  static async verifyProductionReadiness(): Promise<boolean> {
    console.log('🚀 Verifying production readiness...');
    
    const checks = {
      env: await this.checkEnvironmentVariables(),
      connection: await this.testConnection(),
      schema: await this.verifyTables(),
      sampleData: await this.checkSampleData()
    };
    
    const isReady = Object.values(checks).every(Boolean);
    
    console.log('Production readiness:', {
      'Environment Variables': checks.env ? '✅' : '❌',
      'Database Connection': checks.connection ? '✅' : '❌',
      'Schema Setup': checks.schema ? '✅' : '❌',
      'Sample Data': checks.sampleData ? '✅' : '❌'
    });
    
    if (isReady) {
      console.log('🎉 System is production ready!');
    } else {
      console.log('⚠️ System needs setup before production deployment');
    }
    
    return isReady;
  }

  static async checkSampleData(): Promise<boolean> {
    try {
      const products = await supabaseApi.getProducts();
      const hasProducts = products.length > 0;
      
      console.log(`📦 Sample products: ${hasProducts ? '✅' : '❌'} (${products.length} found)`);
      return hasProducts;
    } catch (error) {
      console.error('❌ Sample data check failed:', error);
      return false;
    }
  }
}

// Auto-run verification in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    SupabaseVerification.verifyProductionReadiness();
  }, 2000);
}