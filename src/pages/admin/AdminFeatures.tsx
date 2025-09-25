import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package, Route, MessageSquare, Gift, Brain } from "lucide-react";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import SmartInventory from "@/components/SmartInventory";
import RouteOptimization from "@/components/RouteOptimization";
import FeedbackSystem from "@/components/FeedbackSystem";
import LoyaltyRewards from "@/components/LoyaltyRewards";

const AdminFeatures = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Advanced Features</h1>
            <p className="text-blue-100 mt-1">AI-powered tools for enhanced business operations</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Loyalty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Advanced Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Smart Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartInventory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-purple-500" />
                  Route Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteOptimization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  Customer Feedback Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-pink-500" />
                  Loyalty Program Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoyaltyRewards />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminFeatures;