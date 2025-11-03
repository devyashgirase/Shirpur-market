import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { cartService, type CartItem } from "@/lib/cartService";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import AddressForm, { type AddressData } from "@/components/AddressForm";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import { createOrderInSupabase } from "@/lib/orderCreationService";
import { authService } from "@/lib/authService";

// Load Razorpay script
if (!window.Razorpay && !document.querySelector('script[src*="razorpay"]')) {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.head.appendChild(script);
}

const CustomerCart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<AddressData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

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
    
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
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
    if (cart.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (addressData: AddressData) => {
    setCustomerAddress(addressData);
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.phone) {
      toast({
        title: "Authentication Required",
        description: "Please login to place an order",
        variant: "destructive"
      });
      return;
    }
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (razorpayKey && (window as any).Razorpay) {
      const options = {
        key: razorpayKey,
        amount: Math.round(getTotalAmount() * 100),
        currency: 'INR',
        name: 'Shirpur Delivery',
        description: 'Order Payment',
        handler: async function (response: any) {
          await handlePaymentSuccess(response, addressData, currentUser.phone);
        },
        modal: {
          ondismiss: function() {
            setShowAddressForm(false);
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
    
    // Development mode - simulate payment
    setTimeout(async () => {
      await handlePaymentSuccess(
        { razorpay_payment_id: `dev_${Date.now()}` },
        addressData,
        currentUser.phone
      );
    }, 1000);
  };

  const handlePaymentSuccess = async (paymentResponse: any, addressData: AddressData, customerPhone: string) => {
    try {
      const orderId = `ORD-${Date.now()}`;
      
      const orderData = {
        order_id: orderId,
        customer_name: addressData.name,
        customer_phone: customerPhone,
        customer_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
        delivery_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
        items: cart.map(item => ({
          product_id: parseInt(item.product.id),
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        total_amount: getTotalAmount(),
        order_status: 'confirmed',
        payment_status: 'paid',
        payment_id: paymentResponse.razorpay_payment_id
      };

      const { supabaseApi } = await import('@/lib/supabase');
      await supabaseApi.createOrder(orderData);
      console.log('✅ Order saved via Supabase REST API');
      
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
        description: `Order ${orderId} confirmed and saved to database!`,
      });
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Order Failed",
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Shopping Cart</h1>
          
          <div className="space-y-2 md:space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
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
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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