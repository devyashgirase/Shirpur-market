import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Shield, Truck, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/authService";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();

  const getUserInfo = () => {
    if (!currentUser) {
      return {
        name: 'Guest User',
        phone: '',
        role: 'Guest',
        icon: <User className="w-4 h-4" />,
        initials: 'GU'
      };
    }

    const initials = currentUser.name 
      ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      : currentUser.phone.slice(-2);

    switch (currentUser.role) {
      case 'customer':
        return {
          name: currentUser.name || 'Customer',
          phone: currentUser.phone,
          role: 'Customer',
          icon: <ShoppingBag className="w-4 h-4" />,
          initials
        };
      case 'admin':
        return {
          name: currentUser.name || 'Admin',
          phone: currentUser.phone,
          role: 'Administrator',
          icon: <Shield className="w-4 h-4" />,
          initials
        };
      case 'delivery':
        return {
          name: currentUser.name || 'Delivery Partner',
          phone: currentUser.phone,
          role: 'Delivery Partner',
          icon: <Truck className="w-4 h-4" />,
          initials
        };
      default:
        return {
          name: currentUser.name || 'User',
          phone: currentUser.phone,
          role: 'User',
          icon: <User className="w-4 h-4" />,
          initials
        };
    }
  };

  const handleLogout = () => {
    authService.logout();
    
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
              +91 {userInfo.phone}
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