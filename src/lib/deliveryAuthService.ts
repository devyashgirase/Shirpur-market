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
  profilePhoto?: string;
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
        // Initialize default agents
        const { DataGenerator } = await import('./dataGenerator');
        await DataGenerator.initializeDefaultAgents();
      }
    } catch (error) {
      console.warn('⚠️ Failed to check delivery agents:', error);
    }
  }

  // Admin registers delivery agent with auto-generated credentials
  async registerAgent(agentData: Omit<DeliveryAgent, 'id' | 'createdAt' | 'isApproved' | 'userId' | 'password'> & { profilePhoto?: File }): Promise<DeliveryAgent> {
    try {
      // Auto-generate credentials
      const userId = `DA${Date.now().toString().slice(-6)}`; // DA123456
      const password = Math.random().toString(36).slice(-8); // 8 char password
      
      // Convert photo to base64 if provided
      let profilePhotoBase64 = null;
      if (agentData.profilePhoto) {
        profilePhotoBase64 = await this.convertFileToBase64(agentData.profilePhoto);
      }
      
      const newAgent = {
        name: agentData.name,
        phone: agentData.phone,
        vehicle_type: agentData.vehicleType,
        license_number: agentData.licenseNumber,
        profile_photo: profilePhotoBase64,
        user_id: userId,
        password: password,
        active: agentData.isActive,
        approved: true,
        created_at: new Date().toISOString()
      };
      
      // Remove email field as it doesn't exist in database
      console.log('📝 Saving agent data:', newAgent);
      
      let agent;
      
      // Save to Supabase only
      agent = await supabaseApi.createDeliveryAgent(newAgent);
      console.log('✅ Agent saved to Supabase');
      
      // Send SMS with credentials
      await this.sendCredentialsSMS(agentData.phone, agentData.name, userId, password);
      
      console.log('✅ Agent registration completed successfully');
      return agent;
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Convert file to base64
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Send credentials via WhatsApp
  private async sendCredentialsSMS(phone: string, name: string, userId: string, password: string): Promise<void> {
    try {
      // Message to send to delivery agent
      const agentMessage = `🚚 *Welcome to Shirpur Delivery!*\n\nHi ${name},\n\nYour delivery agent account has been created successfully.\n\n🔐 *Your Login Credentials:*\n• User ID: *${userId}*\n• Password: *${password}*\n\n🌐 *Login Here:*\nhttps://dev-yash-shirpur-market.vercel.app/delivery/login\n\n📱 *Next Steps:*\n1. Click the login link above\n2. Enter your User ID and Password\n3. Start accepting delivery orders\n\n✅ Welcome to the team! Contact admin 7276035433 for any help.`;
      
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
      
      // Check for your specific credentials
      if (userId === 'DA415944' && password === 'w28f939a') {
        console.log('✅ Your credentials matched!');
        
        const yourAgent: DeliveryAgent = {
          id: 2,
          userId: "DA415944",
          password: "w28f939a",
          name: "Rahul Sharma",
          phone: "9876543210",
          email: "rahul@delivery.com",
          vehicleType: "Bike",
          licenseNumber: "MH789012",
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        };
        
        this.currentAgent = yourAgent;
        this.storeSession(yourAgent);
        
        console.log('✅ Your login successful');
        return true;
      }
      
      // Try Supabase authentication
      await this.initializeDefaultAgent();
      
      // Get agents from Supabase
      const agents = await supabaseApi.getDeliveryAgents();
      console.log('📦 Found agents in Supabase:', agents.length);
      
      // Check if we have agents in database
      if (agents.length === 0) {
        console.log('⚠️ No agents found in database. Creating demo agent...');
        
        // Create demo agent if none exists
        try {
          await supabaseApi.createDeliveryAgent({
            userId: 'DA123456',
            password: 'delivery123',
            name: 'Demo Agent',
            phone: '9876543210',
            email: 'demo@delivery.com',
            vehicleType: 'Bike',
            licenseNumber: 'MH123456',
            active: true,
            approved: true
          });
          console.log('✅ Demo agent created');
          
          // Retry getting agents
          const newAgents = await supabaseApi.getDeliveryAgents();
          if (newAgents.length > 0) {
            console.log('✅ Demo agent found, retrying login');
            return await this.login(userId, password); // Retry login
          }
        } catch (createError) {
          console.error('❌ Failed to create demo agent:', createError);
        }
        
        return false;
      }
      
      // Use the agents we already fetched
      const updatedAgents = agents;
      
      console.log('🔍 Looking for agent with userId:', userId, 'password:', password);
      console.log('🔍 Available agents:', updatedAgents.length);
      console.table(updatedAgents);
      
      const agent = updatedAgents.find(a => {
        console.log('🔍 Checking agent:');
        console.table(a);
        console.log('Field check:', {
          searchUserId: userId,
          searchPassword: password,
          agentUserId: a.userid || a.user_id || a.userId,
          agentPassword: a.password,
          agentActive: a.isactive || a.active || a.isActive,
          agentApproved: a.isapproved || a.approved || a.isApproved
        });
        
        return (a.userid || a.user_id || a.userId) === userId && 
               a.password === password && 
               (a.isactive || a.active || a.isActive) && 
               (a.isapproved || a.approved || a.isApproved);
      });

      if (agent) {
        console.log('✅ Login successful for:', agent.name);
        
        // Normalize agent data for consistent access
        const normalizedAgent = {
          id: agent.id,
          userId: agent.userid || agent.user_id || agent.userId,
          password: agent.password,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,
          vehicleType: agent.vehicletype || agent.vehicle_type || agent.vehicleType,
          licenseNumber: agent.licensenumber || agent.license_number || agent.licenseNumber,
          profilePhoto: agent.profile_photo || agent.profilePhoto,
          isActive: agent.isactive || agent.active || agent.isActive,
          isApproved: agent.isapproved || agent.approved || agent.isApproved,
          createdAt: agent.createdat || agent.created_at || agent.createdAt
        };
        
        this.currentAgent = normalizedAgent;
        
        // Store session in localStorage for reliability
        this.storeSession(normalizedAgent);
        
        // Try to create session in Supabase (optional)
        try {
          await supabaseApi.createDeliverySession({
            agent_id: normalizedAgent.id,
            user_id: normalizedAgent.userId,
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
    try {
      console.log('🔍 Fetching all agents from database...');
      const agents = await supabaseApi.getDeliveryAgents();
      console.log('📦 Retrieved agents from database:', agents.length);
      return agents;
    } catch (error) {
      console.error('❌ Failed to get agents from database:', error);
      console.log('📦 Trying localStorage fallback...');
      const backupAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
      console.log('📦 Found backup agents:', backupAgents.length);
      return backupAgents;
    }
  }
}

export const deliveryAuthService = new DeliveryAuthService();