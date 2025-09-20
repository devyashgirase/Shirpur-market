import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';
import { OrderService, Order } from '@/lib/orderService';

interface OrderStatusTrackerProps {
  orderId: string;
  showMap?: boolean;
}

const OrderStatusTracker = ({ orderId, showMap = false }: OrderStatusTrackerProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const statusSteps = [
    {
      key: 'pending',
      label: 'Order Placed',
      icon: Clock,
      description: 'Your order has been received'
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      icon: CheckCircle,
      description: 'Order confirmed and being prepared'
    },
    {
      key: 'packing',
      label: 'Packing',
      icon: Package,
      description: 'Your items are being packed'
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: Truck,
      description: 'On the way to your location'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Order delivered successfully'
    }
  ];

  useEffect(() => {
    // Subscribe to order updates
    const unsubscribe = OrderService.subscribe((orders) => {
      const updatedOrder = orders.find(o => o.orderId === orderId);
      if (updatedOrder) {
        setOrder(updatedOrder);
        const stepIndex = statusSteps.findIndex(step => step.key === updatedOrder.status);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
      }
    });

    // Load initial order
    const initialOrder = OrderService.getOrderById(orderId);
    if (initialOrder) {
      setOrder(initialOrder);
      const stepIndex = statusSteps.findIndex(step => step.key === initialOrder.status);
      setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
    }

    return unsubscribe;
  }, [orderId]);

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Order not found</p>
        </CardContent>
      </Card>
    );
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Status</span>
            <Badge className={`${
              order.status === 'delivered' ? 'bg-green-500' :
              order.status === 'out_for_delivery' ? 'bg-blue-500' :
              order.status === 'packing' ? 'bg-orange-500' :
              'bg-gray-500'
            } text-white`}>
              {statusSteps[currentStep]?.label || 'Processing'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const status = getStepStatus(index);
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(status)}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        status === 'current' ? 'text-blue-600' :
                        status === 'completed' ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </h4>
                      {status === 'current' && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-600">In Progress</span>
                        </div>
                      )}
                      {status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {status === 'current' && order.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Agent Info */}
          {order.status === 'out_for_delivery' && order.deliveryAgent && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Delivery Partner</h5>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {order.deliveryAgent.name}</p>
                <p><strong>Phone:</strong> 
                  <a href={`tel:${order.deliveryAgent.phone}`} className="text-blue-600 hover:underline ml-1">
                    {order.deliveryAgent.phone}
                  </a>
                </p>
                {order.deliveryAgent.location && (
                  <p className="text-green-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Live location tracking active
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Confirmation */}
          {order.status === 'delivered' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h5 className="font-medium text-green-800">Order Delivered Successfully!</h5>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Thank you for choosing Shirpur Delivery. We hope you enjoyed your order!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusTracker;