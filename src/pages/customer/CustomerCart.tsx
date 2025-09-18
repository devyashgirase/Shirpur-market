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
  type CartItem 
} from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import AddressForm, { type AddressData } from "@/components/AddressForm";


const CustomerCart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<AddressData | null>(null);


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
    
    // Store address in localStorage for delivery tracking
    localStorage.setItem('customerAddress', JSON.stringify(addressData));
    
    // Proceed with payment
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: Math.round(getTotalAmount() * 100),
      currency: 'INR',
      name: 'Shirpur Delivery',
      description: 'Order Payment',
      handler: function (response: any) {
        handlePaymentSuccess();
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
    }
  };

  const handlePaymentSuccess = () => {
    // Create order tracking data
    const orderData = {
      orderId: '1001',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      customerAddress: customerAddress
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    toast({
      title: "Order placed!",
      description: `Your order for ₹${getTotalAmount().toFixed(2)} has been placed successfully.`,
    });
    
    const clearedCart = clearCart();
    setCart(clearedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Redirect to tracking page after 2 seconds
    setTimeout(() => {
      window.location.href = '/customer/track';
    }, 2000);
  };

  const getTotalAmount = () => {
    return getCartTotal(cart) + 4.99 + (getCartTotal(cart) * 0.08);
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
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
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{getCartTotal(cart).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹4.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{(getCartTotal(cart) * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
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
    </div>
  );
};

export default CustomerCart;