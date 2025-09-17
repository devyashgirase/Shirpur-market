import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, Package, ShoppingCart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Shirpur Delivery 
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Complete delivery management system for customers, administrators, and delivery personnel
          </p>
        </div>

        {/* Interface Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Customer Portal */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Customer Portal</CardTitle>
              <CardDescription className="text-white/80">
                Browse products, manage your cart, and track orders
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/customer">
                <Button className="bg-white text-primary hover:bg-white/90 w-full">
                  Shop Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Admin Dashboard</CardTitle>
              <CardDescription className="text-white/80">
                Manage products, orders, and delivery assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/admin">
                <Button className="bg-secondary text-white hover:bg-secondary/90 w-full">
                  Admin Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Delivery Portal */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Delivery Portal</CardTitle>
              <CardDescription className="text-white/80">
                View delivery tasks, verify OTPs, and track earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/delivery">
                <Button className="bg-accent text-white hover:bg-accent/90 w-full">
                  View Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">System Features</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Inventory Management</h3>
              <p className="text-sm text-white/80">Real-time stock tracking and low inventory alerts</p>
            </div>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">OTP Verification</h3>
              <p className="text-sm text-white/80">Secure delivery confirmation with time-limited OTPs</p>
            </div>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Role-Based Access</h3>
              <p className="text-sm text-white/80">Separate interfaces for customers, admins, and delivery staff</p>
            </div>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-sm text-white/80">Live order status updates and delivery tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;