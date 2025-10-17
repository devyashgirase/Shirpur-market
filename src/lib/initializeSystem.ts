// System initialization to ensure delivery agents exist
import { DataGenerator } from './dataGenerator';
import { supabaseApi } from './supabase';

export class SystemInitializer {
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('🚀 Initializing Shirpur Delivery System...');
      
      // Check and create delivery agents if needed
      await this.ensureDeliveryAgents();
      
      this.initialized = true;
      console.log('✅ System initialization complete');
    } catch (error) {
      console.error('❌ System initialization failed:', error);
    }
  }

  private static async ensureDeliveryAgents() {
    try {
      const existingAgents = await supabaseApi.getDeliveryAgents();
      console.log(`📊 Found ${existingAgents.length} delivery agents`);
      
      if (existingAgents.length === 0) {
        console.log('🚚 Creating default delivery agents...');
        
        const defaultAgents = DataGenerator.generateDefaultDeliveryAgents();
        let createdCount = 0;
        
        for (const agent of defaultAgents) {
          try {
            await supabaseApi.createDeliveryAgent(agent);
            createdCount++;
            console.log(`✅ Created agent: ${agent.name} (${agent.userId})`);
          } catch (error) {
            console.error(`❌ Failed to create agent ${agent.name}:`, error);
          }
        }
        
        console.log(`🎉 Created ${createdCount} delivery agents`);
        
        // Show success message to user
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const event = new CustomEvent('systemInitialized', {
              detail: { 
                message: `✅ System ready! ${createdCount} delivery agents available.`,
                agentsCreated: createdCount
              }
            });
            window.dispatchEvent(event);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('❌ Failed to ensure delivery agents:', error);
    }
  }

  // Force re-initialization (for admin use)
  static async forceReinitialize() {
    this.initialized = false;
    await this.initialize();
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure other modules are loaded
  setTimeout(() => {
    SystemInitializer.initialize();
  }, 2000);
}