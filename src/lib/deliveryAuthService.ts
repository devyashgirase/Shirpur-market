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
      
      try {
        // Try to save to Supabase first
        agent = await supabaseApi.createDeliveryAgent(newAgent);
        console.log('✅ Agent saved to Supabase');
      } catch (dbError) {
        console.warn('⚠️ Supabase failed, saving locally:', dbError);
        
        // Fallback to localStorage
        const existingAgents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
        existingAgents.push(newAgent);
        localStorage.setItem('deliveryAgents', JSON.stringify(existingAgents));
        agent = newAgent;
        console.log('✅ Agent saved to localStorage');
      }
      
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

  // Agent login
  async login(userId: string, password: string): Promise<boolean> {
    try {
      let agents = [];
      
      try {
        // Try Supabase first
        agents = await supabaseApi.getDeliveryAgents();
      } catch (error) {
        console.warn('Supabase login failed, trying localStorage:', error);
        // Fallback to localStorage
        agents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
      }
      
      const agent = agents.find(a => 
        a.userId === userId && 
        a.password === password && 
        a.isActive && 
        a.isApproved
      );

      if (agent) {
        this.currentAgent = agent;
        localStorage.setItem('deliveryAgent', JSON.stringify(agent));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  // Get current logged in agent
  getCurrentAgent(): DeliveryAgent | null {
    if (this.currentAgent) return this.currentAgent;
    
    const stored = localStorage.getItem('deliveryAgent');
    if (stored) {
      this.currentAgent = JSON.parse(stored);
      return this.currentAgent;
    }
    return null;
  }

  // Check if agent is authenticated
  isAuthenticated(): boolean {
    return !!this.getCurrentAgent();
  }

  // Logout
  logout(): void {
    this.currentAgent = null;
    localStorage.removeItem('deliveryAgent');
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

  // Admin gets all agents for approval
  async getAllAgents(): Promise<DeliveryAgent[]> {
    try {
      // Try Supabase first
      const supabaseAgents = await supabaseApi.getDeliveryAgents();
      if (supabaseAgents.length > 0) {
        return supabaseAgents;
      }
    } catch (error) {
      console.warn('Supabase agents failed:', error);
    }
    
    // Fallback to localStorage
    const localAgents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
    console.log('Using local agents:', localAgents.length);
    return localAgents;
  }
}

export const deliveryAuthService = new DeliveryAuthService();