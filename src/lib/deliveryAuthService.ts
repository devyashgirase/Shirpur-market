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

  // Initialize default delivery agent for testing
  private initializeDefaultAgent() {
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

    // Check if default agent exists
    const existingAgents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
    const hasDefaultAgent = existingAgents.some((agent: DeliveryAgent) => agent.userId === 'DA123456');
    
    if (!hasDefaultAgent) {
      existingAgents.push(defaultAgent);
      localStorage.setItem('deliveryAgents', JSON.stringify(existingAgents));
      console.log('✅ Default delivery agent created: DA123456 / delivery123');
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
    // Ensure default agent exists
    this.initializeDefaultAgent();
    
    try {
      console.log('🔐 Attempting login for:', userId);
      
      // Always check localStorage first for faster response
      let agents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
      console.log('📦 Found agents in localStorage:', agents.length);
      
      // If no local agents, try Supabase
      if (agents.length === 0) {
        try {
          console.log('🌐 Trying Supabase...');
          agents = await supabaseApi.getDeliveryAgents();
          console.log('✅ Supabase agents:', agents.length);
        } catch (error) {
          console.warn('⚠️ Supabase failed:', error);
          // Re-initialize default agent if needed
          this.initializeDefaultAgent();
          agents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
        }
      }
      
      console.log('🔍 Searching for agent with userId:', userId);
      const agent = agents.find(a => {
        console.log('Checking agent:', a.userId, 'password match:', a.password === password, 'active:', a.isActive, 'approved:', a.isApproved);
        return a.userId === userId && 
               a.password === password && 
               a.isActive && 
               a.isApproved;
      });

      if (agent) {
        console.log('✅ Login successful for:', agent.name);
        this.currentAgent = agent;
        localStorage.setItem('deliveryAgent', JSON.stringify(agent));
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