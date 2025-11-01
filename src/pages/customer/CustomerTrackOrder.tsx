import { useSearchParams } from 'react-router-dom';
import { authService } from '@/lib/authService';
import CustomerOrderTracking from '@/components/CustomerOrderTracking';

const CustomerTrackOrder = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const user = authService.getCurrentUser();

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600">Please select an order to track from your orders page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
        <p className="text-gray-600">Order #{orderId}</p>
      </div>
      
      <CustomerOrderTracking 
        orderId={orderId} 
        customerPhone={user?.phone || ''} 
      />
    </div>
  );
};

export default CustomerTrackOrder;