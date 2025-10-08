import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { cartService, type CartItem } from "@/lib/cartService";
import { saveLastOrder } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import AddressForm, { type AddressData } from "@/components/AddressForm";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import PendingPaymentOrders from "@/components/PendingPaymentOrders";
import { OrderService, Order } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { WhatsAppService } from "@/lib/whatsappService";
import { WhatsAppBusinessService } from "@/lib/whatsappBusinessService";
import { FreeWhatsAppService } from "@/lib/freeWhatsAppService";
import { FreeSmsService } from "@/lib/freeSmsService";
import { DataGenerator } from "@/lib/dataGenerator";
import { apiService } from "@/lib/apiService";
import { unifiedDB } from "@/lib/database";


const CustomerCart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<AddressData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);


  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartItems = await cartService.getCartItems();
        setCart(cartItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setCart([]);
      }
    };
    loadCart();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await cartService.updateCartQuantity(productId, newQuantity);
      const updatedCart = await cartService.getCartItems();
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      const updatedCart = await cartService.getCartItems();
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    setShowAddressForm(true);
  };

  const handleAddressSubmit = (addressData: AddressData) => {
    setCustomerAddress(addressData);
    
    // Create pending order
    const pendingOrder = {
      id: Date.now().toString(),
      orderId: `ORD-${Date.now()}`,
      items: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: getTotalAmount(),
      createdAt: new Date().toISOString()
    };
    
    // Save to pending orders
    const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
    pendingOrders.push(pendingOrder);
    localStorage.setItem('pendingPaymentOrders', JSON.stringify(pendingOrders));
    
    // Store customer phone for notifications
    localStorage.setItem('customerPhone', addressData.phone);
    
    // Store address in localStorage for delivery tracking
    localStorage.setItem('customerAddress', JSON.stringify(addressData));
    
    // Proceed with payment
    toast({
      title: "Processing Payment",
      description: "Redirecting to payment gateway...",
    });
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey || razorpayKey.includes('your_razorpay')) {
      // Fallback to test mode with simulation
      toast({
        title: "Development Mode",
        description: "Simulating payment process...",
      });
      
      setTimeout(async () => {
        const paymentId = 'dev_payment_' + Date.now();
        
        // Create order immediately in dev mode
        const orderId = await OrderService.createOrderFromCart(
          {
            name: addressData.name,
            phone: addressData.phone,
            address: `${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
            coordinates: addressData.coordinates || { lat: 21.3099, lng: 75.1178 }
          },
          cart,
          getTotalAmount(),
          paymentId
        );
        
        // Clear cart
        await cartService.clearCart();
        setCart([]);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Show success
        setShowAddressForm(false);
        setLastOrderId(orderId);
        setShowSuccessModal(true);
        
        toast({
          title: "Order Placed Successfully!",
          description: `Test order ${orderId} confirmed!`,
        });
      }, 2000);
      return;
    }
    const isTestMode = razorpayKey.includes('test');
    
    const options = {
      key: razorpayKey,
      amount: Math.round(getTotalAmount() * 100),
      currency: 'INR',
      name: 'Shirpur Delivery',
      description: 'Order Payment',
      handler: async function (response: any) {
        console.log('✅ Razorpay Payment Successful:', response.razorpay_payment_id);
        
        // Immediately create order when Razorpay shows success
        const orderId = await OrderService.createOrderFromCart(
          {
            name: addressData.name,
            phone: addressData.phone,
            address: `${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
            coordinates: addressData.coordinates || { lat: 21.3099, lng: 75.1178 }
          },
          cart,
          getTotalAmount(),
          response.razorpay_payment_id
        );
        
        // Save to database immediately for admin
        try {
          await apiService.createOrder({
            orderId,
            customerName: addressData.name,
            customerPhone: addressData.phone,
            deliveryAddress: `${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
            items: cart.map(item => ({
              productId: parseInt(item.product.id),
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            })),
            total: getTotalAmount(),
            status: 'confirmed',
            paymentStatus: 'paid'
          });
        } catch (e) { console.warn('DB save failed:', e); }
        
        // Clear cart and update UI
        await cartService.clearCart();
        setCart([]);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Remove from pending orders
        const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
        const updatedOrders = pendingOrders.filter((order: any) => order.orderId !== pendingOrder.orderId);
        localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));
        
        // Show success immediately
        setShowAddressForm(false);
        setLastOrderId(orderId);
        setShowSuccessModal(true);
        
        toast({
          title: "Order Placed Successfully!",
          description: `Order ${orderId} confirmed and available in tracking!`,
        });
      },
      modal: {
        ondismiss: function() {
          handlePaymentFailure();
        }
      },
      prefill: {
        name: addressData.name,
        email: 'customer@example.com',
        contact: addressData.phone
      },
      theme: {
        color: '#3B82F6'
      }
    };
    
    if ((window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Fallback for development - simulate payment process
      toast({
        title: "Development Mode",
        description: "Simulating payment process...",
      });
      
      setTimeout(async () => {
        // Clear cart in development mode
        await cartService.clearCart();
        setCart([]);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        const paymentId = 'dev_payment_' + Date.now();
        
        // Create order immediately
        const orderId = await OrderService.createOrderFromCart(
          {
            name: addressData.name,
            phone: addressData.phone,
            address: `${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
            coordinates: addressData.coordinates || { lat: 21.3099, lng: 75.1178 }
          },
          cart,
          getTotalAmount(),
          paymentId
        );
        
        // Show success
        setShowAddressForm(false);
        setLastOrderId(orderId);
        setShowSuccessModal(true);
        
        toast({
          title: "Order Placed Successfully!",
          description: `Test order ${orderId} confirmed!`,
        });
      }, 2000);
    }
  };

  const handlePaymentFailure = () => {
    toast({
      title: "Payment Failed",
      description: "Payment failed, please try again.",
      variant: "destructive"
    });
    setShowAddressForm(false);
  };

  const handlePaymentSuccess = async (paymentId?: string, isTestMode?: boolean) => {
    if (!customerAddress) return;
    
    const testMode = isTestMode || !paymentId || paymentId.includes('test') || paymentId.includes('dev');
    
    try {
      // Create order using OrderService with confirmed status
      const orderId = await OrderService.createOrderFromCart(
        {
          name: customerAddress.name,
          phone: customerAddress.phone,
          address: `${customerAddress.address}, ${customerAddress.city}, ${customerAddress.state} - ${customerAddress.pincode}`,
          coordinates: customerAddress.coordinates || { lat: 21.3099, lng: 75.1178 }
        },
        cart,
        getTotalAmount(),
        paymentId
      );
      
      // Update payment status to paid for both test and live payments
      await OrderService.updatePaymentStatus(orderId, 'paid', paymentId);
      
      // Save order to database via API for admin tracking
      try {
        await apiService.createOrder({
          orderId,
          customerName: customerAddress.name,
          customerPhone: customerAddress.phone,
          deliveryAddress: `${customerAddress.address}, ${customerAddress.city}, ${customerAddress.state} - ${customerAddress.pincode}`,
          items: cart.map(item => ({
            productId: parseInt(item.product.id),
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          total: getTotalAmount(),
          status: 'confirmed',
          paymentStatus: 'paid'
        });
        console.log('✅ Order saved to database for admin tracking');
      } catch (dbError) {
        console.warn('⚠️ Failed to save to database, order saved locally:', dbError);
      }
      
      // Update product inventory
      try {
        for (const item of cart) {
          await apiService.updateProductStock(parseInt(item.product.id), -item.quantity);
        }
        console.log('✅ Product inventory updated');
      } catch (stockError) {
        console.warn('⚠️ Failed to update inventory:', stockError);
      }
      
      // Clear cart immediately after successful payment
      await cartService.clearCart();
      setCart([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Also clear from OrderService
      await OrderService.clearCartAfterOrder(customerAddress.phone);
      
      // Remove from pending orders if exists
      const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
      const updatedOrders = pendingOrders.filter((order: any) => order.id !== Date.now().toString());
      localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));
      
      // Trigger admin panel updates
      window.dispatchEvent(new CustomEvent('orderCreated', { detail: { orderId, status: 'confirmed', paymentStatus: 'paid' } }));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      
      // Close address form and show success
      setShowAddressForm(false);
      setLastOrderId(orderId);
      setShowSuccessModal(true);
      
      toast({
        title: "Order Placed Successfully!",
        description: testMode ? 
          `Test order ${orderId} confirmed - Available in admin panel for processing!` :
          `Order ${orderId} for ₹${getTotalAmount().toFixed(2)} has been confirmed and is being processed.`,
      });
      
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: "Order Creation Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const getTotalAmount = () => {
    const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return subtotal + 4.99 + (subtotal * 0.08);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePayPendingOrder = (order: any) => {
    setPendingPaymentOrder(order);
    setShowAddressForm(true);
  };

  const handleRemovePendingOrder = (orderId: string) => {
    // Order already removed in component
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products from our catalog to get started
          </p>
          <Link to="/customer">
            <Button className="bg-gradient-primary">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Pending Payment Orders */}
      <div className="mb-6">
        <PendingPaymentOrders 
          onPayNow={handlePayPendingOrder}
          onRemove={handleRemovePendingOrder}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Shopping Cart</h1>
          
          <div className="space-y-2 md:space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-3 md:p-6">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.product.sku} • Per {item.product.unit}
                        </p>
                        <p className="text-base font-bold text-primary mt-1">
                          ₹{Number(item.product.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center text-sm"
                          min="1"
                          max={item.product.stock_qty}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_qty}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <p className="text-base font-bold">
                        ₹{(Number(item.product.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product.sku} • Per {item.product.unit}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">
                        ₹{Number(item.product.price || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                        min="1"
                        max={item.product.stock_qty}
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_qty}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ₹{(Number(item.product.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm md:text-base">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Delivery Fee</span>
                  <span>₹4.99</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Tax</span>
                  <span>₹{(getCartTotal() * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>Total</span>
                  <span>₹{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                Proceed to Checkout
              </Button>
              
              <Link to="/customer" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Form */}
      <AddressForm
        isOpen={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onSubmit={handleAddressSubmit}
      />
      
      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={lastOrderId}
      />
    </div>
  );
};

export default CustomerCart;