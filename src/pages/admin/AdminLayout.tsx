import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, ArrowLeft, Users, Settings } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-secondary-foreground hover:text-secondary-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link to="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"} 
                  className={!isActive('/admin') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/admin/products">
                <Button 
                  variant={isActive('/admin/products') ? "default" : "ghost"} 
                  className={!isActive('/admin/products') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </Button>
              </Link>
              
              <Link to="/admin/orders">
                <Button 
                  variant={isActive('/admin/orders') ? "default" : "ghost"} 
                  className={!isActive('/admin/orders') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;