import React, { useState, useEffect } from 'react';
import { AdminOrderService, AdminOrder } from '../../lib/adminOrderService';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadOrders();
    loadStats();

    // Subscribe to real-time updates
    const subscription = AdminOrderService.subscribeToOrderUpdates((updatedOrders) => {
      setOrders(updatedOrders);
      loadStats();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const orderData = await AdminOrderService.getAllOrders();
    setOrders(orderData);
    setLoading(false);
  };

  const loadStats = async () => {
    const statsData = await AdminOrderService.getOrderStats();
    setStats(statsData);
  };

  const handleViewDetails = (order: AdminOrder) => {
    alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customer_name}\nPhone: ${order.customer_phone}\nAddress: ${order.customer_address}\nItems: ${order.items.map((item: any) => `${item.name} x${item.quantity}`).join(', ')}\nTotal: ₹${order.total_amount}\nStatus: ${order.order_status}\nPayment: ${order.payment_status}\nDate: ${new Date(order.created_at).toLocaleString()}`);
  };

  const handleTrackOrder = (orderId: string) => {
    // Get agent location from localStorage
    const allAgentLocations = JSON.parse(localStorage.getItem('all_agent_locations') || '{}');
    const activeAgents = Object.values(allAgentLocations).filter((location: any) => {
      const locationTime = new Date(location.timestamp).getTime();
      const now = new Date().getTime();
      return (now - locationTime) < 30 * 60 * 1000; // Last 30 minutes
    });
    
    if (activeAgents.length > 0) {
      const agent = activeAgents[0] as any;
      alert(`Order Tracking:\n\nOrder ID: ${orderId}\nAgent Location: ${agent.lat}, ${agent.lng}\nLast Updated: ${new Date(agent.timestamp).toLocaleString()}\n\nNote: Real-time tracking is active!`);
    } else {
      alert(`Order Tracking:\n\nOrder ID: ${orderId}\nStatus: Out for Delivery\n\nNo active agent location found.\nAgent will update location when delivery starts.`);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: AdminOrder['order_status']) => {
    const success = await AdminOrderService.updateOrderStatusWithNotification(orderId, newStatus);
    if (success) {
      console.log('Order status updated successfully');
      // Manually update the order in state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );
      
      // Notify customer in real-time
      window.dispatchEvent(new CustomEvent('orderStatusChanged', {
        detail: { 
          orderId, 
          newStatus, 
          customerPhone: orders.find(o => o.id === orderId)?.customer_phone 
        }
      }));
      
      // Show tracking notification for out_for_delivery
      if (newStatus === 'out_for_delivery') {
        window.dispatchEvent(new CustomEvent('enableTracking', {
          detail: { orderId }
        }));
      }
    } else {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready_for_delivery: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions: AdminOrder['order_status'][] = [
    'placed', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h1>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.placed}</div>
              <div className="text-sm text-gray-600">Placed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
              <div className="text-sm text-gray-600">Preparing</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-indigo-600">{stats.out_for_delivery}</div>
              <div className="text-sm text-gray-600">Out for Delivery</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx}>{item.name} x{item.quantity}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                      order.payment_status === 'failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(order.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value as AdminOrder['order_status'])}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          View Details
                        </button>
                        {order.order_status === 'out_for_delivery' && (
                          <button
                            onClick={() => handleTrackOrder(order.id)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No orders found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;