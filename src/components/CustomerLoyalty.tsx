import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Coins } from "lucide-react";

const CustomerLoyalty = () => {
  const loyaltyData = {
    points: 450,
    tier: "Silver",
    nextTierPoints: 1000,
    availableRewards: 3
  };

  const progress = (loyaltyData.points / loyaltyData.nextTierPoints) * 100;

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span className="font-bold text-lg">{loyaltyData.points}</span>
          </div>
          <Badge className="bg-white/20 text-white">{loyaltyData.tier}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Gold</span>
            <span>{loyaltyData.points}/{loyaltyData.nextTierPoints}</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Gift className="h-4 w-4" />
          <span>{loyaltyData.availableRewards} rewards available</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerLoyalty;