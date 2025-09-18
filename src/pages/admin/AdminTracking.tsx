import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Truck, User, Clock, Navigation } from "lucide-react";
import { mockDeliveryTasks } from "@/lib/mockData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  currentLocation: { lat: number; lng: number } | null;
  isActive: boolean;
  activeTask?: any;
}

const AdminTracking = () => {
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([
    {
      id: "delivery_1",
      name: "Raj Patel",
      phone: "+91 98765 43210",
      currentLocation: { lat: 21.3486, lng: 74.8811 },
      isActive: true,
      activeTask: mockDeliveryTasks[0]
    },
    {
      id: "delivery_2", 
      name: "Amit Kumar",
      phone: "+91 87654 32109",
      currentLocation: { lat: 21.3500, lng: 74.8820 },
      isActive: true,
      activeTask: mockDeliveryTasks[1]
    },
    {
      id: "delivery_3",
      name: "Suresh Singh",
      phone: "+91 76543 21098",
      currentLocation: null,
      isActive: false
    }
  ]);

  useEffect(() => {
    // Update delivery partner locations from live tracking data
    const updateLiveLocations = () => {
      const liveDelivery = localStorage.getItem('liveDelivery');
      if (liveDelivery) {
        const deliveryData = JSON.parse(liveDelivery);
        setDeliveryPartners(prev => 
          prev.map(partner => 
            partner.id === 'delivery_1' 
              ? { ...partner, currentLocation: deliveryData.deliveryAgentLocation, isActive: true }
              : partner
          )
        );
      }
    };

    updateLiveLocations();
    
    // Refresh every 5 seconds for live updates
    const interval = setInterval(updateLiveLocations, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Leaflet icons
  const deliveryIcon = L.divIcon({
    html: `<div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 18px;">🚚</span></div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const customerIcon = L.divIcon({
    html: `<div style="background-color: #dc2626; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 16px;">📍</span></div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const activePartners = deliveryPartners.filter(p => p.isActive && p.currentLocation);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Live Delivery Tracking</h1>
        <p className="text-muted-foreground">Monitor delivery partners and customer deliveries in real-time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Delivery Partners List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Delivery Partners</h2>
          {deliveryPartners.map((partner) => (
            <Card 
              key={partner.id} 
              className={`cursor-pointer transition-all ${
                selectedPartner === partner.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPartner(partner.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.phone}</p>
                    </div>
                  </div>
                  <Badge variant={partner.isActive ? "default" : "secondary"}>
                    {partner.isActive ? "Active" : "Offline"}
                  </Badge>
                </div>
                
                {partner.activeTask && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <div className="flex items-center space-x-1 mb-1">
                      <Truck className="w-3 h-3" />
                      <span>Order #{partner.activeTask.order_id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{partner.activeTask.customer_name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Live Map View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapContainer
                center={[21.3486, 74.8811]}
                zoom={13}
                style={{ height: "500px", width: "100%", borderRadius: "0.5rem" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Delivery Partners */}
                {activePartners.map((partner) => (
                  <Marker 
                    key={partner.id}
                    position={[partner.currentLocation!.lat, partner.currentLocation!.lng]} 
                    icon={deliveryIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-semibold">🚚 {partner.name}</p>
                        <p className="text-sm text-muted-foreground">📞 {partner.phone}</p>
                        {partner.activeTask && (
                          <div className="mt-2">
                            <p className="text-sm">Delivering Order #{partner.activeTask.order_id}</p>
                            <p className="text-xs">To: {partner.activeTask.customer_name}</p>
                            <p className="text-xs text-green-600">🔴 Live tracking active</p>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Customer Locations */}
                {mockDeliveryTasks.map((task) => {
                  // Get customer address from localStorage if available
                  const storedAddress = localStorage.getItem('customerAddress');
                  let customerData = null;
                  if (storedAddress) {
                    customerData = JSON.parse(storedAddress);
                  }
                  
                  const lat = customerData?.coordinates?.lat || task.delivery_lat || 21.3486;
                  const lng = customerData?.coordinates?.lng || task.delivery_lng || 74.8811;
                  
                  return (
                    <Marker 
                      key={task.id}
                      position={[lat, lng]} 
                      icon={customerIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <p className="font-semibold">{customerData?.name || task.customer_name}</p>
                          <p className="text-sm">Order #{task.order_id}</p>
                          {customerData?.phone && (
                            <p className="text-xs text-blue-600">📞 {customerData.phone}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {customerData?.address || task.customer_address}
                          </p>
                          {customerData?.coordinates && (
                            <p className="text-xs text-green-600">📍 Live location</p>
                          )}
                          <p className="text-sm font-semibold mt-1">${task.total_amount?.toFixed(2)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Partner Details */}
      {selectedPartner && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Partner Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const partner = deliveryPartners.find(p => p.id === selectedPartner);
              if (!partner) return null;
              
              return (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Partner Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {partner.name}</p>
                      <p><span className="font-medium">Phone:</span> {partner.phone}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge className="ml-2" variant={partner.isActive ? "default" : "secondary"}>
                          {partner.isActive ? "Active" : "Offline"}
                        </Badge>
                      </p>
                      {partner.currentLocation && (
                        <p><span className="font-medium">Location:</span> {partner.currentLocation.lat.toFixed(4)}, {partner.currentLocation.lng.toFixed(4)}</p>
                      )}
                    </div>
                  </div>
                  
                  {partner.activeTask && (
                    <div>
                      <h3 className="font-semibold mb-2">Current Delivery</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Order:</span> #{partner.activeTask.order_id}</p>
                        <p><span className="font-medium">Customer:</span> {partner.activeTask.customer_name}</p>
                        <p><span className="font-medium">Address:</span> {partner.activeTask.customer_address}</p>
                        <p><span className="font-medium">Amount:</span> ${partner.activeTask.total_amount?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTracking;