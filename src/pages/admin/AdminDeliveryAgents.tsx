import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    email: '',
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
      const agentList = await deliveryAuthService.getAllAgents();
      setAgents(agentList);
    } catch (error) {
      console.error('Failed to load agents:', error);
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

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.vehicleType || !formData.licenseNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const agent = await deliveryAuthService.registerAgent(formData);
      
      toast({
        title: "Agent Registered Successfully",
        description: `Credentials sent to ${formData.phone}. User ID: ${agent.userId}`,
      });
      
      setShowAddForm(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleType: '',
        licenseNumber: '',
        profilePhoto: null,
        isActive: true
      });
      setPhotoPreview(null);
      
      await loadAgents();
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register delivery agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Delivery Agents</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const { SystemInitializer } = await import('@/lib/initializeSystem');
                await SystemInitializer.forceReinitialize();
                toast({
                  title: "System Reinitialized",
                  description: "Default delivery agents have been created",
                });
                await loadAgents();
              } catch (error) {
                toast({
                  title: "Initialization Failed",
                  description: "Failed to create default agents",
                  variant: "destructive"
                });
              }
            }}
          >
            🚚 Create Default Agents
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
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
                
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <Input
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <Input
                  placeholder="Vehicle Type (e.g., Bike, Car)"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  required
                />
                <Input
                  placeholder="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  required
                />
                <Button type="submit" className="w-full">Register Agent</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
            <Card key={agent.id}>
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
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">User ID: <span className="font-medium">{agent.userId}</span></p>
                        <p className="text-gray-600">Phone: <span className="font-medium">{agent.phone}</span></p>
                        {agent.email && (
                          <p className="text-gray-600">Email: <span className="font-medium">{agent.email}</span></p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Vehicle: <span className="font-medium">{agent.vehicleType}</span></p>
                        <p className="text-gray-600">License: <span className="font-medium">{agent.licenseNumber}</span></p>
                        <p className="text-gray-600">Registered: <span className="font-medium">{new Date(agent.createdAt).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Credentials sent via SMS
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDeliveryAgents;