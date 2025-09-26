import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { 
  getCartFromStorage, 
  updateCartQuantity, 
  removeFromCart, 
  clearCart, 
  getCartTotal,
  saveLastOrder,
  type CartItem 
} from "@/lib/mockData";
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
    setCart(getCartFromStorage());
  }, []);

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = updateCartQuantity(productId, newQuantity);
    setCart(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const removeItem = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
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
    
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: Math.round(getTotalAmount() * 100),
      currency: 'INR',
      name: 'Shirpur Delivery',
      description: 'Order Payment',
      handler: function (response: any) {
        console.log('Payment successful:', response.razorpay_payment_id);
        // Remove from pending orders
        const pendingOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');
        const updatedOrders = pendingOrders.filter((order: any) => order.orderId !== pendingOrder.orderId);
        localStorage.setItem('pendingPaymentOrders', JSON.stringify(updatedOrders));
        handlePaymentSuccess();
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. Your cart is still saved.",
            variant: "destructive"
          });
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
      // Fallback for development - simulate successful payment
      setTimeout(() => {
        handlePaymentSuccess();
      }, 1000);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!customerAddress) return;
    
    // Generate unique order ID using DataGenerator
    const orderId = DataGenerator.generateOrderId();
    
    // Generate dynamic customer data if not provided
    const dynamicCustomer = customerAddress.name ? customerAddress : {
      ...DataGenerator.generateCustomer(),
      ...customerAddress
    };
    
    // Create order using OrderService
    const orderData: Order = {
      orderId,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      customerAddress: {
        ...dynamicCustomer,
        coordinates: dynamicCustomer.coordinates || DataGenerator.generateShirpurCoordinates()
      },
      items: cart.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price
        },
        quantity: item.quantity
      })),
      total: getTotalAmount(),
      paymentStatus: 'paid'
    };
    
    // Save order to real database (Supabase)
    try {
      const dbOrderData = {
        customerName: dynamicCustomer.name,
        customerPhone: dynamicCustomer.phone,
        deliveryAddress: `${dynamicCustomer.address}, ${dynamicCustomer.city}, ${dynamicCustomer.state} - ${dynamicCustomer.pincode}`,
        total: getTotalAmount(),
        status: 'confirmed',
        paymentStatus: 'paid',
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      };
      
      console.log('💾 Saving order to database:', orderId);
      
      // Save to unified database (auto-switches MySQL/Supabase)
      const dbOrder = await unifiedDB.createOrder(dbOrderData);
      if (dbOrder) {
        console.log('✅ Order saved to database with ID:', dbOrder.id);
        orderData.databaseId = dbOrder.id;
      } else {
        console.error('❌ Failed to save order to database');
      }
    } catch (error) {
      console.error('❌ Failed to save order to database:', error);
    }
    
    // Store order data in localStorage for tracking
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    allOrders.push(orderData);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    // Send FREE WhatsApp notification (no API costs)
    try {
      // Generate WhatsApp link for order confirmation
      const whatsappLink = FreeWhatsAppService.sendOrderNotification(
        dynamicCustomer.phone,
        orderData
      );
      
      // Send OTP for delivery verification
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem(`otp_${orderId}`, otp);
      
      // Send FREE SMS as primary notification
      await FreeSmsService.sendOrderConfirmationSMS(dynamicCustomer, orderData, otp);
      
      console.log('✅ FREE WhatsApp link generated & SMS sent');
      console.log('📱 WhatsApp Link:', whatsappLink);
    } catch (error) {
      console.error('❌ Failed to send notifications:', error);
    }
    
    // Send notifications
    NotificationService.sendOrderStatusNotification(orderId, 'confirmed', 'customer');
    NotificationService.sendOrderStatusNotification(orderId, 'confirmed', 'admin');
    
    // Save order for tracking
    saveLastOrder(orderData);
    
    // Clear cart
    clearCart();
    setCart([]);
    
    // Show success modal
    setLastOrderId(orderId);
    setShowSuccessModal(true);
    
    toast({
      title: "Order Placed Successfully!",
      description: `Order ${orderId} for ₹${getTotalAmount().toFixed(2)} has been confirmed.`,
    });
  };

  const getTotalAmount = () => {
    return getCartTotal(cart) + 4.99 + (getCartTotal(cart) * 0.08);
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
                          ₹{item.product.price.toFixed(2)}
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
                        ₹{(item.product.price * item.quantity).toFixed(2)}
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
                        ₹{item.product.price.toFixed(2)}
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
                        ₹{(item.product.price * item.quantity).toFixed(2)}
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
                  <span>₹{getCartTotal(cart).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Delivery Fee</span>
                  <span>₹4.99</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Tax</span>
                  <span>₹{(getCartTotal(cart) * 0.08).toFixed(2)}</span>
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