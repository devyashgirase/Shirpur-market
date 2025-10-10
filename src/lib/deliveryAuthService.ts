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
  private readonly AUTH_KEY = 'delivery_auth_session';

  constructor() {
    this.initializeDefaultAgent();
    this.loadStoredSession();
  }

  // Load stored session from localStorage
  private loadStoredSession() {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) {
        this.currentAgent = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored session:', error);
    }
  }

  // Store session in localStorage
  private storeSession(agent: DeliveryAgent) {
    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(agent));
    } catch (error) {
      console.warn('Failed to store session:', error);
    }
  }

  // Clear stored session
  private clearStoredSession() {
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (error) {
      console.warn('Failed to clear stored session:', error);
    }
  }

  // Initialize default delivery agent in Supabase
  private async initializeDefaultAgent() {
    try {
      const agents = await supabaseApi.getDeliveryAgents();
      console.log('🔍 Found agents in database:', agents.length);
      
      if (agents.length === 0) {
        console.log('⚠️ No delivery agents found in database');
      }
    } catch (error) {
      console.warn('⚠️ Failed to check delivery agents:', error);
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

  // Send credentials via WhatsApp
  private async sendCredentialsSMS(phone: string, name: string, userId: string, password: string): Promise<void> {
    try {
      // Message to send to delivery agent
      const agentMessage = `🚚 *Welcome to Shirpur Delivery!*\n\nHi ${name},\n\nYour delivery agent account has been created successfully.\n\n🔐 *Your Login Credentials:*\n• User ID: *${userId}*\n• Password: *${password}*\n\n🌐 *Login at:* https://dev-yash-shirpur-market.vercel.app/delivery/login\n\n📱 *Next Steps:*\n1. Click the login link above\n2. Enter your User ID and Password\n3. Start accepting delivery orders\n\n✅ Welcome to the team! Contact admin 7276035433 for any help.`;
      
      // Format phone number (remove +91 if present, add 91 prefix)
      const formattedPhone = phone.replace(/^\+?91/, '91');
      const agentWhatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(agentMessage)}`;
      
      // Auto-open WhatsApp to send message to delivery agent
      if (typeof window !== 'undefined') {
        window.open(agentWhatsAppUrl, '_blank');
      }
      
      console.log('📱 WhatsApp message prepared for delivery agent:', { name, phone: formattedPhone, userId });
      
      // Store notification log
      localStorage.setItem(`whatsapp_agent_${phone}_${Date.now()}`, JSON.stringify({
        agentPhone: formattedPhone,
        agentName: name,
        userId,
        password,
        message: agentMessage,
        timestamp: new Date().toISOString(),
        type: 'delivery_agent_credentials'
      }));
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
    }
  }

  // Agent login - Supabase with fallback
  async login(userId: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Attempting login for:', userId);
      
      // Check for hardcoded demo credentials first
      if (userId === 'DA123456' && password === 'delivery123') {
        console.log('✅ Demo credentials matched!');
        
        const demoAgent: DeliveryAgent = {
          id: 1,
          userId: "DA123456",
          password: "delivery123",
          name: "Demo Agent",
          phone: "9876543210",
          email: "demo@delivery.com",
          vehicleType: "Bike",
          licenseNumber: "MH123456",
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        };
        
        this.currentAgent = demoAgent;
        this.storeSession(demoAgent);
        
        console.log('✅ Demo login successful');
        return true;
      }
      
      // Try Supabase authentication
      await this.initializeDefaultAgent();
      
      // Get agents from Supabase
      const agents = await supabaseApi.getDeliveryAgents();
      console.log('📦 Found agents in Supabase:', agents.length);
      
      // Check if we have agents in database
      if (agents.length === 0) {
        console.log('⚠️ No agents found in database.');
        return false;
      }
      
      // Use the agents we already fetched
      const updatedAgents = agents;
      
      console.log('🔍 Looking for agent with userId:', userId, 'password:', password);
      console.log('🔍 Available agents:', updatedAgents.map(a => ({
        userId: a.userId,
        password: a.password,
        isActive: a.isActive,
        isApproved: a.isApproved
      })));
      
      const agent = updatedAgents.find(a => {
        console.log('🔍 Checking agent:', {
          userId: a.userId,
          password: a.password,
          isActive: a.isActive,
          isApproved: a.isApproved,
          userIdMatch: a.userId === userId,
          passwordMatch: a.password === password,
          isActiveMatch: a.isActive,
          isApprovedMatch: a.isApproved
        });
        
        return a.userId === userId && 
               a.password === password && 
               a.isActive && 
               a.isApproved;
      });

      if (agent) {
        console.log('✅ Login successful for:', agent.name);
        this.currentAgent = agent;
        
        // Store session in localStorage for reliability
        this.storeSession(agent);
        
        // Try to create session in Supabase (optional)
        try {
          await supabaseApi.createDeliverySession({
            agent_id: agent.id,
            user_id: agent.userId,
            login_time: new Date().toISOString(),
            is_active: true
          });
          console.log('✅ Supabase session created');
        } catch (sessionError) {
          console.warn('⚠️ Session creation failed, but login successful:', sessionError);
        }
        
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
  async getCurrentAgent(): Promise<DeliveryAgent | null> {
    // Return current agent if available
    if (this.currentAgent) return this.currentAgent;
    
    // Try to load from localStorage
    this.loadStoredSession();
    if (this.currentAgent) return this.currentAgent;
    
    // Try to get from Supabase session as fallback
    try {
      const session = await supabaseApi.getActiveDeliverySession();
      if (session) {
        const agents = await supabaseApi.getDeliveryAgents();
        this.currentAgent = agents.find(a => a.id === session.agent_id) || null;
        if (this.currentAgent) {
          this.storeSession(this.currentAgent);
        }
        return this.currentAgent;
      }
    } catch (error) {
      console.error('Failed to get current agent from Supabase:', error);
    }
    
    return null;
  }

  // Check if agent is authenticated - now with localStorage backup
  async isAuthenticated(): Promise<boolean> {
    // Check current agent first
    if (this.currentAgent) {
      return true;
    }
    
    // Load from localStorage
    this.loadStoredSession();
    if (this.currentAgent) {
      return true;
    }
    
    // Try Supabase as fallback
    try {
      const session = await supabaseApi.getActiveDeliverySession();
      if (session) {
        const agents = await supabaseApi.getDeliveryAgents();
        this.currentAgent = agents.find(a => a.id === session.agent_id) || null;
        if (this.currentAgent) {
          this.storeSession(this.currentAgent);
          return true;
        }
      }
    } catch (error) {
      console.warn('Supabase authentication check failed:', error);
    }
    
    return false;
  }

  // Logout - clear all sessions
  async logout(): Promise<void> {
    try {
      // Clear localStorage session
      this.clearStoredSession();
      this.currentAgent = null;
      
      // Try to end Supabase session
      try {
        await supabaseApi.endDeliverySession();
      } catch (error) {
        console.warn('Failed to end Supabase session:', error);
      }
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