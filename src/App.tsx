import { Toaster } from "@/components/ui/toaster";
import { SweetAlertProvider } from "@/components/ui/sweet-alert";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/components/ui/animations.css";
import "@/styles/razorpay-fix.css";

import { useEffect } from "react";
import { startNotificationDemo } from "@/lib/testNotifications";
import { SupabaseVerification } from "@/lib/supabaseVerification";
import DeliveryBackground from "@/components/DeliveryBackground";
import OTPLogin from "./pages/OTPLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerCatalog from "./pages/customer/CustomerCatalog";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails";
import CustomerOrderTracking from "./pages/customer/CustomerOrderTracking";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminLiveTracking from "./pages/admin/AdminLiveTracking";
import AdminFeatures from "./pages/admin/AdminFeatures";
import AdminCarousel from "./pages/admin/AdminCarousel";
import AdminDeliveryAgents from "./pages/admin/AdminDeliveryAgents";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryTasks from "./pages/delivery/DeliveryTasks";
import DeliveryTaskDetail from "./pages/delivery/DeliveryTaskDetail";
import DeliveryNotifications from "./pages/delivery/DeliveryNotifications";
import DeliveryTracking from "./pages/delivery/DeliveryTracking";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";
import DeliveryOutForDelivery from "./pages/delivery/DeliveryOutForDelivery";
import TrackingDemo from "./pages/TrackingDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Start notification demo for testing
    startNotificationDemo();
    
    // Verify Supabase setup in development
    if (import.meta.env.DEV) {
      setTimeout(() => {
        SupabaseVerification.verifyProductionReadiness();
      }, 3000);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SweetAlertProvider>
          <DeliveryBackground />
          <Toaster />
          <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<OTPLogin />} />
          <Route path="/home" element={<Index />} />
          <Route path="/login" element={<OTPLogin />} />
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/tracking-demo" element={<TrackingDemo />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CustomerCatalog />} />
            <Route path="cart" element={<CustomerCart />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="order-details/:orderId" element={<CustomerOrderDetails />} />
            <Route path="track" element={<CustomerOrderTracking />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="tracking" element={<AdminTracking />} />
            <Route path="delivery-agents" element={<AdminDeliveryAgents />} />
            <Route path="live-tracking" element={<AdminLiveTracking />} />
            <Route path="carousel" element={<AdminCarousel />} />
            <Route path="features" element={<AdminFeatures />} />
          </Route>
          
          {/* Delivery Routes */}
          <Route path="/delivery" element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DeliveryTasks />} />
            <Route path="notifications" element={<DeliveryNotifications />} />
            <Route path="out-for-delivery" element={<DeliveryOutForDelivery />} />
            <Route path="task/:taskId" element={<DeliveryTaskDetail />} />
            <Route path="tracking" element={<DeliveryTracking />} />
            <Route path="profile" element={<DeliveryProfile />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
        </SweetAlertProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
