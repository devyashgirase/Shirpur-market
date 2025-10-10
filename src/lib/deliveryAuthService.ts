// Delivery Agent Authentication Service
import { supabaseApi } from './supabase';

export interface DeliveryAgent {
  id: number;
  userId: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: string;
  licenseNumber: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

class DeliveryAuthService {
  private currentAgent: DeliveryAgent | null = null;

  constructor() {
    this.initializeDefaultAgent();
  }

  // Initialize default delivery agent in Supabase
  private async initializeDefaultAgent() {
    try {
      const agents = await supabaseApi.getDeliveryAgents();
      const hasDefaultAgent = agents.some((agent: DeliveryAgent) => agent.userId === 'DA123456');
      
      if (!hasDefaultAgent) {
        const defaultAgent: DeliveryAgent = {
          id: 1,
          userId: "DA123456",
          password: "delivery123",
          name: "John Doe",
          phone: "9876543210",
          email: "john@delivery.com",
          vehicleType: "Bike",
          licenseNumber: "MH123456",
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        };
        
        await supabaseApi.createDeliveryAgent(defaultAgent);
        console.log('✅ Default delivery agent created in Supabase: DA123456 / delivery123');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize default agent in Supabase:', error);
    }
  }

  // Admin registers delivery agent with auto-generated credentials
  async registerAgent(agentData: Omit<DeliveryAgent, 'id' | 'createdAt' | 'isApproved' | 'userId' | 'password'>): Promise<DeliveryAgent> {
    try {
      // Auto-generate credentials
      const userId = `DA${Date.now().toString().slice(-6)}`; // DA123456
      const password = Math.random().toString(36).slice(-8); // 8 char password
      
      const newAgent = {
        ...agentData,
        userId,
        password,
        isApproved: true,
        createdAt: new Date().toISOString(),
        id: Date.now()
      };
      
      let agent;
      
      // Save to Supabase only
      agent = await supabaseApi.createDeliveryAgent(newAgent);
      console.log('✅ Agent saved to Supabase');
      
      // Send SMS with credentials
      await this.sendCredentialsSMS(agentData.phone, agentData.name, userId, password);
      
      return agent;
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Send credentials via SMS
  private async sendCredentialsSMS(phone: string, name: string, userId: string, password: string): Promise<void> {
    try {
      const message = `Welcome ${name}! Your Shirpur Delivery credentials:\nUser ID: ${userId}\nPassword: ${password}\nLogin at: shirpur-delivery.com/delivery/login`;
      
      // Use SMS service (you can integrate with any SMS provider)
      console.log('📱 SMS sent to', phone, ':', message);
      
      // Store SMS log
      localStorage.setItem(`sms_${phone}_${Date.now()}`, JSON.stringify({
        phone,
        message,
        timestamp: new Date().toISOString(),
        type: 'delivery_credentials'
      }));
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }

  // Agent login - Supabase only
  async login(userId: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Attempting login for:', userId);
      
      // Get agents from Supabase
      const agents = await supabaseApi.getDeliveryAgents();
      console.log('📦 Found agents in Supabase:', agents.length);
      
      const agent = agents.find(a => 
        a.userId === userId && 
        a.password === password && 
        a.isActive && 
        a.isApproved
      );

      if (agent) {
        console.log('✅ Login successful for:', agent.name);
        this.currentAgent = agent;
        
        // Create session in Supabase
        await supabaseApi.createDeliverySession({
          agent_id: agent.id,
          user_id: agent.userId,
          login_time: new Date().toISOString(),
          is_active: true
        });
        
        return true;
      } else {
        console.log('❌ No matching agent found');
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }

  // Get current logged in agent from Supabase session
  async getCurrentAgent(): Promise<DeliveryAgent | null> {
    if (this.currentAgent) return this.currentAgent;
    
    try {
      const session = await supabaseApi.getActiveDeliverySession();
      if (session) {
        const agents = await supabaseApi.getDeliveryAgents();
        this.currentAgent = agents.find(a => a.id === session.agent_id) || null;
        return this.currentAgent;
      }
    } catch (error) {
      console.error('Failed to get current agent:', error);
    }
    return null;
  }

  // Check if agent is authenticated via Supabase session
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await supabaseApi.getActiveDeliverySession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Logout - end Supabase session
  async logout(): Promise<void> {
    try {
      await supabaseApi.endDeliverySession();
      this.currentAgent = null;
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // Admin approves agent
  async approveAgent(agentId: number): Promise<boolean> {
    try {
      await supabaseApi.updateDeliveryAgent(agentId, { isApproved: true });
      return true;
    } catch (error) {
      console.error('Failed to approve agent:', error);
      return false;
    }
  }

  // Admin gets all agents from Supabase
  async getAllAgents(): Promise<DeliveryAgent[]> {
    return await supabaseApi.getDeliveryAgents();
  }
}

export const deliveryAuthService = new DeliveryAuthService();