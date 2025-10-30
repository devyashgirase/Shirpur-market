// Completely disable Supabase to prevent Node.js warnings and headers errors
export const supabase = null;
export const isSupabaseConfigured = false;

// Import REST client
import { supabaseRest } from './supabaseRest';

// Mock data for development
const mockData = {
  products: [
    { 
      id: 1, 
      name: 'Fresh Tomatoes', 
      price: 40, 
      category: 'Vegetables', 
      stockQuantity: 100, 
      isActive: true, 
      imageUrl: '/placeholder.svg', 
      description: 'Fresh red tomatoes',
      created_at: new Date().toISOString()
    },
    { 
      id: 2, 
      name: 'Basmati Rice', 
      price: 120, 
      category: 'Grains', 
      stockQuantity: 50, 
      isActive: true, 
      imageUrl: '/placeholder.svg', 
      description: 'Premium basmati rice',
      created_at: new Date().toISOString()
    }
  ],
  orders: [],
  categories: [
    { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true },
    { id: 2, name: 'Grains', slug: 'grains', isActive: true }
  ]
};

import { supabaseRest } from './supabaseRest';

export const supabaseApi = {
  async getProducts() {
    try {
      return await supabaseRest.get('products');
    } catch (error) {
      console.warn('Using mock products:', error);
      return mockData.products;
    }
  },
  
  async getOrders() {
    try {
      return await supabaseRest.get('orders', 'order=created_at.desc');
    } catch (error) {
      console.warn('Using mock orders:', error);
      return JSON.parse(localStorage.getItem('orders') || '[]');
    }
  },
  
  async createOrder(order: any) {
    try {
      return await supabaseRest.post('orders', {
        order_id: order.order_id || `ORD${Date.now()}`,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        items: order.items,
        total_amount: order.total_amount,
        status: 'confirmed',
        payment_status: 'paid'
      });
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const newOrder = { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      return newOrder;
    }
  },
  
  async getDeliveryAgents() {
    try {
      const agents = await supabaseRest.get('delivery_agents');
      return agents.map((agent: any) => ({
        id: agent.id,
        userId: agent.userid,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicleType: agent.vehicletype,
        licenseNumber: agent.licensenumber,
        isActive: agent.isactive
      }));
    } catch (error) {
      console.warn('Using localStorage agents:', error);
      return JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
    }
  },
  
  async createDeliveryAgent(agent: any) {
    try {
      const result = await supabaseRest.post('delivery_agents', {
        userid: agent.userId,
        password: agent.password,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicletype: agent.vehicleType,
        licensenumber: agent.licenseNumber,
        isactive: true,
        isapproved: true
      });
      return result[0];
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const agentWithId = { id: Date.now(), ...agent };
      const existingAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
      existingAgents.push(agentWithId);
      localStorage.setItem('delivery_agents_backup', JSON.stringify(existingAgents));
      return agentWithId;
    }
  }
};