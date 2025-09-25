import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Trophy, Coins } from "lucide-react";

interface LoyaltyData {
  points: number;
  tier: string;
  nextTierPoints: number;
  totalOrders: number;
  rewards: Array<{
    id: string;
    name: string;
    pointsCost: number;
    description: string;
    available: boolean;
  }>;
}

const LoyaltyRewards = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({
    points: 450,
    tier: "Silver",
    nextTierPoints: 1000,
    totalOrders: 12,
    rewards: [
      { id: "1", name: "Free Delivery", pointsCost: 100, description: "Free delivery on next order", available: true },
      { id: "2", name: "10% Discount", pointsCost: 200, description: "10% off on orders above ₹500", available: true },
      { id: "3", name: "Premium Support", pointsCost: 500, description: "Priority customer support", available: false }
    ]
  });

  const progressToNextTier = (loyaltyData.points / loyaltyData.nextTierPoints) * 100;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Loyalty Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="h-6 w-6" />
            <span className="text-2xl font-bold">{loyaltyData.points}</span>
          </div>
          <p className="text-sm opacity-90">Loyalty Points</p>
          <Badge className="mt-2 bg-white/20 text-white">{loyaltyData.tier} Member</Badge>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Gold</span>
            <span>{loyaltyData.points}/{loyaltyData.nextTierPoints}</span>
          </div>
          <Progress value={progressToNextTier} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Available Rewards
          </h4>
          {loyaltyData.rewards.map((reward) => (
            <div key={reward.id} className={`p-3 rounded-lg border ${reward.available ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
                <Badge variant={reward.available ? "default" : "secondary"}>
                  {reward.pointsCost} pts
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoyaltyRewards;