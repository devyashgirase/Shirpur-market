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
import { DatabaseService } from "@/lib/databaseService";


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
        console.log('Loading cart items...');
        const cartItems = await cartService.getCartItems();
        console.log('Cart items loaded:', cartItems);
        setCart(cartItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setCart([]);
      }
    };
    
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      console.log('Cart update event received, reloading cart...');
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      console.log('Updating quantity for product:', productId, 'to:', newQuantity);
      const success = await cartService.updateCartQuantity(productId, newQuantity);
      if (success) {
        const updatedCart = await cartService.getCartItems();
        setCart(updatedCart);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      console.log('Removing item from cart:', productId);
      const success = await cartService.removeFromCart(productId);
      if (success) {
        const updatedCart = await cartService.getCartItems();
        setCart(updatedCart);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = () => {
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (addressData: AddressData) => {
    setCustomerAddress(addressData);
    setShowAddressForm(false); // Close address form before opening payment
    
    // Create pending order in Supabase
    const pendingOrder = {
      order_id: `ORD-${Date.now()}`,
      customer_name: addressData.name,
      customer_phone: addressData.phone,
      delivery_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
      items: JSON.stringify(cart.map(item => ({
        product_id: parseInt(item.product.id),
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))),
      total_amount: getTotalAmount(),
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Save pending order to Supabase
    await DatabaseService.createOrder(pendingOrder);
    
    // Proceed with payment
    console.log('Starting payment process for order total:', getTotalAmount());
    toast({
      title: "Processing Payment",
      description: "Redirecting to payment gateway...",
    });
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log('Razorpay Key:', razorpayKey);
    console.log('Razorpay SDK loaded:', !!(window as any).Razorpay);
    
    // Force use Razorpay if key exists and SDK is loaded
    if (razorpayKey && (window as any).Razorpay) {
      console.log('Using live Razorpay payment');
      
      const options = {
        key: razorpayKey,
        amount: Math.round(getTotalAmount() * 100),
        currency: 'INR',
        name: 'Shirpur Delivery',
        description: 'Order Payment',
        handler: async function (response: any) {
          console.log('✅ Razorpay Payment Successful:', response.razorpay_payment_id);
          
          // Create order immediately when Razorpay shows success
          const orderId = await OrderService.createOrderFromCart(
            {
              name: addressData.name,
              phone: addressData.phone,
              address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
              coordinates: addressData.coordinates || { lat: 21.3099, lng: 75.1178 }
            },
            cart,
            getTotalAmount(),
            response.razorpay_payment_id
          );
          
          // Save to database immediately for admin
          try {
            await DatabaseService.createOrder({
              order_id: orderId,
              customer_name: addressData.name,
              customer_phone: addressData.phone,
              delivery_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
              items: JSON.stringify(cart.map(item => ({
                product_id: parseInt(item.product.id),
                product_name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
              }))),
              total_amount: getTotalAmount(),
              status: 'confirmed',
              payment_status: 'paid',
              created_at: new Date().toISOString()
            });
          } catch (e) { console.warn('DB save failed:', e); }
          
          // Store order for tracking first
          const orderForTracking = {
            orderId,
            customerName: addressData.name,
            customerPhone: addressData.phone,
            deliveryAddress: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
            total: getTotalAmount(),
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: new Date().toISOString(),
            items: cart
          };
          
          localStorage.setItem('currentOrder', JSON.stringify(orderForTracking));
          
          // Clear cart and update UI
          await cartService.clearCart();
          setCart([]);
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          
          // Force reload to ensure cart is empty
          setTimeout(async () => {
            const emptyCart = await cartService.getCartItems();
            setCart(emptyCart);
            setLastOrderId(orderId);
            setShowSuccessModal(true);
          }, 200);
          
          toast({
            title: "Order Placed Successfully!",
            description: `Order ${orderId} confirmed and available in tracking!`,
          });
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay modal dismissed');
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
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      return;
    }
    
    console.log('Using development mode - no valid Razorpay key or SDK not loaded');
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
          address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
          coordinates: addressData.coordinates || { lat: 21.3099, lng: 75.1178 }
        },
        cart,
        getTotalAmount(),
        paymentId
      );
      
      // Store order for tracking first
      const orderForTracking = {
        orderId,
        customerName: addressData.name,
        customerPhone: addressData.phone,
        deliveryAddress: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
        total: getTotalAmount(),
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        items: cart
      };
      
      localStorage.setItem('currentOrder', JSON.stringify(orderForTracking));
      
      // Clear cart
      await cartService.clearCart();
      setCart([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Force reload to ensure cart is empty
      setTimeout(async () => {
        const emptyCart = await cartService.getCartItems();
        setCart(emptyCart);
        setLastOrderId(orderId);
        setShowSuccessModal(true);
      }, 200);
      
      toast({
        title: "Order Placed Successfully!",
        description: `Test order ${orderId} confirmed!`,
      });
    }, 2000);
  };

  const handlePaymentFailure = async () => {
    if (!customerAddress) return;
    
    try {
      // Create order in database even when payment fails
      const orderId = `ORD-${Date.now()}`;
      
      await DatabaseService.createOrder({
        order_id: orderId,
        customer_name: customerAddress.name,
        customer_phone: customerAddress.phone,
        delivery_address: `${customerAddress.address}${customerAddress.landmark ? ', ' + customerAddress.landmark : ''}${customerAddress.city ? ', ' + customerAddress.city : ''}${customerAddress.state ? ', ' + customerAddress.state : ''} - ${customerAddress.pincode}`,
        items: JSON.stringify(cart.map(item => ({
          product_id: parseInt(item.product.id),
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))),
        total_amount: getTotalAmount(),
        status: 'pending',
        payment_status: 'failed',
        created_at: new Date().toISOString()
      });
      
      // Also save locally for compatibility
      await OrderService.createOrderFromCart(
        {
          name: customerAddress.name,
          phone: customerAddress.phone,
          address: `${customerAddress.address}${customerAddress.landmark ? ', ' + customerAddress.landmark : ''}${customerAddress.city ? ', ' + customerAddress.city : ''}${customerAddress.state ? ', ' + customerAddress.state : ''} - ${customerAddress.pincode}`,
          coordinates: customerAddress.coordinates || { lat: 21.3099, lng: 75.1178 }
        },
        cart,
        getTotalAmount(),
        'payment_failed'
      );
      
      // Update payment status to failed
      await OrderService.updatePaymentStatus(orderId, 'failed', 'payment_failed');
      
      // Trigger admin panel updates
      window.dispatchEvent(new CustomEvent('orderCreated', { detail: { orderId, status: 'pending', paymentStatus: 'failed' } }));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
      console.log('✅ Order saved to database with failed payment status');
      
    } catch (error) {
      console.error('Failed to save order with failed payment:', error);
    }
    
    toast({
      title: "Payment Failed",
      description: "Payment failed but order saved. You can retry payment from pending orders.",
      variant: "destructive"
    });
    setShowAddressForm(false);
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