import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, TrendingUp, Package, Bell } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  weeklyConsumption: number;
  predictedStockout: number;
  category: string;
  supplier: string;
}

const SmartInventory = () => {
  const [inventory] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Basmati Rice",
      currentStock: 15,
      minThreshold: 20,
      maxCapacity: 100,
      weeklyConsumption: 25,
      predictedStockout: 3,
      category: "Grains",
      supplier: "Local Supplier A"
    },
    {
      id: 2,
      name: "Toor Dal",
      currentStock: 8,
      minThreshold: 15,
      maxCapacity: 80,
      weeklyConsumption: 18,
      predictedStockout: 2,
      category: "Pulses",
      supplier: "Wholesale Market"
    },
    {
      id: 3,
      name: "Cooking Oil",
      currentStock: 45,
      minThreshold: 25,
      maxCapacity: 120,
      weeklyConsumption: 12,
      predictedStockout: 15,
      category: "Oil",
      supplier: "Brand Distributor"
    }
  ]);

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxCapacity) * 100;
    if (item.currentStock <= item.minThreshold) return { status: 'critical', color: 'bg-red-500', text: 'Critical' };
    if (percentage < 30) return { status: 'low', color: 'bg-orange-500', text: 'Low Stock' };
    if (percentage > 80) return { status: 'high', color: 'bg-green-500', text: 'Well Stocked' };
    return { status: 'normal', color: 'bg-blue-500', text: 'Normal' };
  };

  const generateRestockSuggestion = (item: InventoryItem) => {
    const weeksUntilStockout = item.currentStock / (item.weeklyConsumption / 7);
    const suggestedOrder = Math.max(item.maxCapacity - item.currentStock, item.weeklyConsumption * 2);
    return {
      urgency: weeksUntilStockout < 7 ? 'high' : weeksUntilStockout < 14 ? 'medium' : 'low',
      suggestedQuantity: suggestedOrder,
      daysUntilStockout: Math.floor(weeksUntilStockout)
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Smart Inventory Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {inventory.filter(item => item.currentStock <= item.minThreshold).length}
              </div>
              <p className="text-sm text-red-600">Critical Items</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {inventory.filter(item => (item.currentStock / item.maxCapacity) < 0.3).length}
              </div>
              <p className="text-sm text-orange-600">Low Stock</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {inventory.filter(item => (item.currentStock / item.maxCapacity) > 0.8).length}
              </div>
              <p className="text-sm text-green-600">Well Stocked</p>
            </div>
          </div>

          <div className="space-y-4">
            {inventory.map((item) => {
              const status = getStockStatus(item);
              const restock = generateRestockSuggestion(item);
              const stockPercentage = (item.currentStock / item.maxCapacity) * 100;

              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category} • {item.supplier}</p>
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      {status.text}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="font-semibold">{item.currentStock} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Weekly Usage</p>
                      <p className="font-semibold">{item.weeklyConsumption} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Until Stockout</p>
                      <p className="font-semibold text-orange-600">{restock.daysUntilStockout} days</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Suggested Reorder</p>
                      <p className="font-semibold text-blue-600">{restock.suggestedQuantity} units</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stock Level</span>
                      <span>{item.currentStock}/{item.maxCapacity}</span>
                    </div>
                    <Progress value={stockPercentage} className="h-2" />
                  </div>

                  {item.currentStock <= item.minThreshold && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                      <Bell className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Urgent Restock Required</p>
                        <p className="text-xs text-red-600">Stock below minimum threshold</p>
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        Reorder Now
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartInventory;