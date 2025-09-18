import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Shield, Truck, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userRole = localStorage.getItem('userRole') || 'guest';

  const getUserInfo = () => {
    switch (userRole) {
      case 'customer':
        return {
          name: 'Customer User',
          email: 'customer@shirpur.com',
          role: 'Customer',
          icon: <ShoppingBag className="w-4 h-4" />,
          initials: 'CU'
        };
      case 'admin':
        return {
          name: 'Admin User',
          email: 'admin@shirpur.com',
          role: 'Administrator',
          icon: <Shield className="w-4 h-4" />,
          initials: 'AU'
        };
      case 'delivery':
        return {
          name: 'Delivery Partner',
          email: 'delivery@shirpur.com',
          role: 'Delivery Partner',
          icon: <Truck className="w-4 h-4" />,
          initials: 'DP'
        };
      default:
        return {
          name: 'Guest User',
          email: 'guest@shirpur.com',
          role: 'Guest',
          icon: <User className="w-4 h-4" />,
          initials: 'GU'
        };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    navigate('/');
  };

  const userInfo = getUserInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {userInfo.initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              {userInfo.icon}
              <p className="text-sm font-medium leading-none">{userInfo.name}</p>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {userInfo.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Role: {userInfo.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;