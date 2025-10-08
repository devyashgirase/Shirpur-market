import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Phone, Car, CheckCircle, XCircle } from 'lucide-react';
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
    isActive: true
  });

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

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deliveryAuthService.registerAgent(formData);
      toast({
        title: "Agent Registered",
        description: "Credentials sent via SMS to agent's phone",
      });
      setShowAddForm(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleType: '',
        licenseNumber: '',
        isActive: true
      });
      loadAgents();
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register delivery agent",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (agentId: number) => {
    try {
      await deliveryAuthService.approveAgent(agentId);
      toast({
        title: "Agent Approved",
        description: "Delivery agent has been approved",
      });
      loadAgents();
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve agent",
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
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
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Credentials sent via SMS
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