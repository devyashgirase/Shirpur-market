import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Upload, X } from 'lucide-react';
import { deliveryAuthService, type DeliveryAgent } from '@/lib/deliveryAuthService';
import { useToast } from '@/hooks/use-toast';

const AdminDeliveryAgents = () => {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    licenseNumber: '',
    profilePhoto: null as File | null,
    isActive: true
  });

  const [dragActive, setDragActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      console.log('🔍 Loading agents for admin panel...');
      
      // Force fresh data from database
      const agentList = await deliveryAuthService.getAllAgents();
      console.log('📦 Fresh agents from database:', agentList);
      console.log('📊 Database agent count:', agentList.length);
      
      // Always show all agents from database first
      const allAgents = [...agentList];
      
      // Add demo agents only if they don't exist in database
      const demoAgents = [
        {
          id: 1001,
          userId: 'DA415944',
          name: 'Rahul Sharma',
          phone: '9876543210',
          email: 'rahul@delivery.com',
          vehicleType: 'Motorcycle',
          licenseNumber: 'MH789012',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 1002,
          userId: 'DA123456',
          name: 'Demo Agent',
          phone: '9876543211',
          email: 'demo@delivery.com',
          vehicleType: 'Bike',
          licenseNumber: 'MH123456',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 1003,
          userId: 'DA617627',
          name: 'Production Agent',
          phone: '9876543212',
          email: 'agent@delivery.com',
          vehicleType: 'Bike',
          licenseNumber: 'MH345678',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Add demo agents that don't exist in database
      demoAgents.forEach(demo => {
        if (!allAgents.find(existing => existing.userId === demo.userId)) {
          allAgents.push(demo);
        }
      });
      
      console.log('✅ Final agents list:', allAgents.length, 'agents');
      console.log('📋 Agent details:', allAgents.map(a => ({ id: a.id, userId: a.userId, name: a.name })));
      
      setAgents(allAgents);
      
    } catch (error) {
      console.error('❌ Failed to load agents:', error);
      
      // Fallback to demo agents only on complete failure
      const fallbackAgents = [
        {
          id: 1001,
          userId: 'DA415944',
          name: 'Rahul Sharma',
          phone: '9876543210',
          email: 'rahul@delivery.com',
          vehicleType: 'Motorcycle',
          licenseNumber: 'MH789012',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 1002,
          userId: 'DA123456',
          name: 'Demo Agent',
          phone: '9876543211',
          email: 'demo@delivery.com',
          vehicleType: 'Bike',
          licenseNumber: 'MH123456',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 1003,
          userId: 'DA617627',
          name: 'Production Agent',
          phone: '9876543212',
          email: 'agent@delivery.com',
          vehicleType: 'Bike',
          licenseNumber: 'MH345678',
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      setAgents(fallbackAgents);
      console.log('⚠️ Using fallback demo agents');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData({...formData, profilePhoto: file});
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter agent's full name",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters long",
        variant: "destructive"
      });
      return false;
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter phone number",
        variant: "destructive"
      });
      return false;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive"
      });
      return false;
    }
    

    
    // Vehicle type validation
    if (!formData.vehicleType.trim()) {
      toast({
        title: "Vehicle Type Required",
        description: "Please enter vehicle type",
        variant: "destructive"
      });
      return false;
    }
    
    // License number validation
    if (!formData.licenseNumber.trim()) {
      toast({
        title: "License Required",
        description: "Please enter license number",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.licenseNumber.trim().length < 5) {
      toast({
        title: "Invalid License",
        description: "License number must be at least 5 characters",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('🔄 Starting agent registration...');
      const agent = await deliveryAuthService.registerAgent(formData);
      console.log('✅ Agent registered:', agent);
      
      toast({
        title: "Agent Registered Successfully",
        description: `Credentials sent to ${formData.phone}. User ID: ${agent.user_id || agent.userId}`,
      });
      
      // Reset form
      setShowAddForm(false);
      setFormData({
        name: '',
        phone: '',
        vehicleType: '',
        licenseNumber: '',
        profilePhoto: null,
        isActive: true
      });
      setPhotoPreview(null);
      
      // Force reload agents from database
      console.log('🔄 Reloading agents list...');
      setLoading(true);
      await loadAgents();
      setLoading(false);
      console.log('✅ Agents list reloaded');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register delivery agent. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Agents</h1>
          <p className="text-gray-600 mt-1">Manage delivery agent registrations and credentials</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Loading...' : 'Add Agent'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Delivery Agent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAgent} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                  📱 User ID and Password will be auto-generated and sent via SMS
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Photo</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {photoPreview ? (
                      <div className="relative">
                        <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full mx-auto object-cover" />
                        <button
                          type="button"
                          onClick={() => {setPhotoPreview(null); setFormData({...formData, profilePhoto: null});}}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Drag & drop photo here</p>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                          className="hidden"
                          id="photo-upload"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Input
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum 2 characters</p>
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: cleaned});
                    }}
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-gray-500">10-digit Indian mobile number</p>
                </div>

                <div className="space-y-1">
                  <Select value={formData.vehicleType} onValueChange={(value) => setFormData({...formData, vehicleType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike">🏍️ Bike/Motorcycle</SelectItem>
                      <SelectItem value="scooter">🛵 Scooter</SelectItem>
                      <SelectItem value="bicycle">🚲 Bicycle</SelectItem>
                      <SelectItem value="car">🚗 Car</SelectItem>
                      <SelectItem value="auto">🚕 Auto Rickshaw</SelectItem>
                      <SelectItem value="van">🚐 Van</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose delivery vehicle type</p>
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="License Number *"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum 5 characters, driving license number</p>
                </div>
                <Button type="submit" className="w-full">Register Agent</Button>
              </form>
            </DialogContent>
          </Dialog>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">📊 Total Agents: <span className="font-bold">{agents.length}</span></p>
        </div>
        
        <div className="grid gap-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Delivery Agents</h3>
                <p className="text-gray-600">Register delivery agents to start managing deliveries</p>
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={`${agent.id}-${agent.userId}`} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {agent.profilePhoto ? (
                      <img 
                        src={agent.profilePhoto} 
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <Badge variant={agent.isActive ? "default" : "destructive"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {agent.id > 1000 && (
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">User ID: <span className="font-medium">{agent.userId}</span></p>
                          <p className="text-gray-600">Phone: <span className="font-medium">{agent.phone}</span></p>
                          <p className="text-gray-600">Status: <span className="font-medium">{agent.isActive ? 'Active' : 'Inactive'}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vehicle: <span className="font-medium">{agent.vehicleType}</span></p>
                          <p className="text-gray-600">License: <span className="font-medium">{agent.licenseNumber}</span></p>
                          <p className="text-gray-600">Registered: <span className="font-medium">{new Date(agent.createdAt).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {agent.id > 1000 ? 'Demo Agent' : 'Credentials sent via SMS'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryAgents;