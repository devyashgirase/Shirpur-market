import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Plus, Phone, User, MapPin, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";
import { FreeSmsService } from "@/lib/freeSmsService";

interface DeliveryAgent {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  vehicleType: string;
  licenseNumber: string;
  photo?: string;
  isActive: boolean;
  createdAt?: string;
}

const AdminDeliveryAgents = () => {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<DeliveryAgent>({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    licenseNumber: "",
    photo: "",
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await apiService.getDeliveryAgents();
      setAgents(agentList);
    } catch (error) {
      console.warn("Failed to load agents from API, using local storage");
      const localAgents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
      setAgents(localAgents);
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({...formData, photo: e.target?.result as string});
      };
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to database
      const newAgent = await apiService.createDeliveryAgent(formData);
      
      // Save to local storage as backup
      const localAgents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
      localAgents.push(newAgent || { ...formData, id: Date.now() });
      localStorage.setItem('deliveryAgents', JSON.stringify(localAgents));

      // Send SMS notification
      await FreeSmsService.sendDeliveryAgentWelcome(formData.phone, formData.name);

      toast({
        title: "Agent Registered Successfully!",
        description: `${formData.name} has been registered and SMS sent to ${formData.phone}`,
      });

      // Reset form and reload
      setFormData({
        name: "",
        phone: "",
        email: "",
        vehicleType: "",
        licenseNumber: "",
        photo: "",
        isActive: true
      });
      setShowForm(false);
      loadAgents();

    } catch (error) {
      console.error("Failed to register agent:", error);
      toast({
        title: "Registration Failed",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Truck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Delivery Agents</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Agent
        </Button>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {agent.photo ? (
                    <img src={agent.photo} alt={agent.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 p-2 bg-gray-100 rounded-full" />
                  )}
                  <span>{agent.name}</span>
                </div>
                <Badge className={agent.isActive ? "bg-green-500" : "bg-gray-500"}>
                  {agent.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{agent.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{agent.vehicleType}</span>
              </div>
              <div className="text-xs text-gray-500">
                License: {agent.licenseNumber}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Delivery Agents</h3>
            <p className="text-muted-foreground mb-4">
              Register delivery agents to handle order deliveries
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-primary">
              Register First Agent
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registration Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New Delivery Agent</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter agent name"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="agent@example.com"
              />
            </div>

            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select onValueChange={(value) => setFormData({...formData, vehicleType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="license">License Number *</Label>
              <Input
                id="license"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                placeholder="DL1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="photo">Agent Photo</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.photo ? (
                  <div className="space-y-2">
                    <img src={formData.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover mx-auto" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({...formData, photo: ""})}
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">Drag & drop photo here or click to browse</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('photo-input')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                📱 SMS notification will be sent to the agent's phone number after registration
              </p>
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-gradient-primary">
                {loading ? "Registering..." : "Register Agent"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeliveryAgents;