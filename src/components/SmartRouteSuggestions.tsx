import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, Fuel, MapPin, Zap } from "lucide-react";

const SmartRouteSuggestions = () => {
  const suggestions = [
    {
      id: 1,
      title: "Optimal Route",
      description: "3 deliveries in Gandhi Chowk area",
      estimatedTime: "45 min",
      fuelSaving: "15%",
      priority: "high"
    },
    {
      id: 2,
      title: "Quick Route",
      description: "2 nearby deliveries",
      estimatedTime: "25 min",
      fuelSaving: "8%",
      priority: "medium"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-500" />
          Smart Route Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{suggestion.title}</h4>
              <Badge className={suggestion.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                {suggestion.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{suggestion.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{suggestion.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4 text-green-500" />
                <span>{suggestion.fuelSaving} saved</span>
              </div>
            </div>
            <Button size="sm" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Start Route
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          Auto-Optimize All Routes
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartRouteSuggestions;