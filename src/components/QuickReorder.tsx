import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus } from "lucide-react";

const QuickReorder = () => {
  const recentOrders = [
    { id: 1, items: "Rice, Dal, Oil", total: 450, date: "2 days ago" },
    { id: 2, items: "Vegetables, Milk", total: 280, date: "1 week ago" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="h-5 w-5" />
          Quick Reorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">{order.items}</p>
              <p className="text-xs text-gray-600">₹{order.total} • {order.date}</p>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickReorder;