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

  // Admin registers delivery agent
  async registerAgent(agentData: Omit<DeliveryAgent, 'id' | 'createdAt' | 'isApproved'>): Promise<DeliveryAgent> {
    try {
      const agent = await supabaseApi.createDeliveryAgent({
        ...agentData,
        isApproved: false, // Admin must approve
        createdAt: new Date().toISOString()
      });
      return agent;
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw new Error('Registration failed');
    }
  }

  // Agent login
  async login(userId: string, password: string): Promise<boolean> {
    try {
      const agents = await supabaseApi.getDeliveryAgents();
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
      return await supabaseApi.getDeliveryAgents();
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }
}

export const deliveryAuthService = new DeliveryAuthService();