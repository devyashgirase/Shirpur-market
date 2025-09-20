import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/components/ui/animations.css";
import { useEffect } from "react";
import { startNotificationDemo } from "@/lib/testNotifications";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerCatalog from "./pages/customer/CustomerCatalog";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerOrderTracking from "./pages/customer/CustomerOrderTracking";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminLiveTracking from "./pages/admin/AdminLiveTracking";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import DeliveryTasks from "./pages/delivery/DeliveryTasks";
import DeliveryTaskDetail from "./pages/delivery/DeliveryTaskDetail";
import DeliveryNotifications from "./pages/delivery/DeliveryNotifications";
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CustomerCatalog />} />
            <Route path="cart" element={<CustomerCart />} />
            <Route path="orders" element={<CustomerOrders />} />
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
            <Route path="live-tracking" element={<AdminLiveTracking />} />
          </Route>
          
          {/* Delivery Routes */}
          <Route path="/delivery" element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DeliveryTasks />} />
            <Route path="notifications" element={<DeliveryNotifications />} />
            <Route path="task/:taskId" element={<DeliveryTaskDetail />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
