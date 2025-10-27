export type OrderStatus = 
  | 'pending'           // Customer placed order, payment pending
  | 'confirmed'         // Payment confirmed, order accepted
  | 'preparing'         // Kitchen/store preparing order
  | 'ready_for_delivery'// Order ready, waiting for delivery agent
  | 'out_for_delivery'  // Delivery agent assigned and on the way
  | 'delivered'         // Order successfully delivered
  | 'cancelled'         // Order cancelled
  | 'failed'           // Delivery failed
  | 'returned';        // Order returned

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  canTransitionTo: OrderStatus[];
  isTerminal: boolean;
  estimatedTime?: number; // minutes
}

export class OrderStatusService {
  private static readonly STATUS_CONFIG: Record<OrderStatus, OrderStatusInfo> = {
    pending: {
      status: 'pending',
      label: 'Pending',
      description: 'Order placed, awaiting payment confirmation',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      icon: '⏳',
      canTransitionTo: ['confirmed', 'cancelled'],
      isTerminal: false,
      estimatedTime: 5
    },
    confirmed: {
      status: 'confirmed',
      label: 'Confirmed',
      description: 'Payment confirmed, order accepted',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      icon: '✅',
      canTransitionTo: ['preparing', 'cancelled'],
      isTerminal: false,
      estimatedTime: 10
    },
    preparing: {
      status: 'preparing',
      label: 'Preparing',
      description: 'Order is being prepared',
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
      icon: '👨‍🍳',
      canTransitionTo: ['ready_for_delivery', 'out_for_delivery', 'cancelled'],
      isTerminal: false,
      estimatedTime: 20
    },
    ready_for_delivery: {
      status: 'ready_for_delivery',
      label: 'Ready for Delivery',
      description: 'Order ready, waiting for delivery agent',
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      icon: '📦',
      canTransitionTo: ['out_for_delivery', 'cancelled'],
      isTerminal: false,
      estimatedTime: 15
    },
    out_for_delivery: {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'Delivery agent is on the way',
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      icon: '🚚',
      canTransitionTo: ['delivered', 'failed', 'returned'],
      isTerminal: false,
      estimatedTime: 30
    },
    delivered: {
      status: 'delivered',
      label: 'Delivered',
      description: 'Order successfully delivered',
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      icon: '✅',
      canTransitionTo: [],
      isTerminal: true
    },
    cancelled: {
      status: 'cancelled',
      label: 'Cancelled',
      description: 'Order has been cancelled',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      icon: '❌',
      canTransitionTo: [],
      isTerminal: true
    },
    failed: {
      status: 'failed',
      label: 'Delivery Failed',
      description: 'Delivery attempt failed',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      icon: '⚠️',
      canTransitionTo: ['out_for_delivery', 'returned', 'cancelled'],
      isTerminal: false
    },
    returned: {
      status: 'returned',
      label: 'Returned',
      description: 'Order returned to store',
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      icon: '↩️',
      canTransitionTo: ['cancelled'],
      isTerminal: false
    }
  };

  // Get status information
  static getStatusInfo(status: OrderStatus): OrderStatusInfo {
    return this.STATUS_CONFIG[status];
  }

  // Get all possible statuses
  static getAllStatuses(): OrderStatusInfo[] {
    return Object.values(this.STATUS_CONFIG);
  }

  // Check if transition is valid
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const fromConfig = this.STATUS_CONFIG[from];
    return fromConfig.canTransitionTo.includes(to);
  }

  // Get next possible statuses
  static getNextStatuses(currentStatus: OrderStatus): OrderStatusInfo[] {
    const config = this.STATUS_CONFIG[currentStatus];
    return config.canTransitionTo.map(status => this.STATUS_CONFIG[status]);
  }

  // Get status flow for display
  static getStatusFlow(): OrderStatusInfo[] {
    return [
      this.STATUS_CONFIG.pending,
      this.STATUS_CONFIG.confirmed,
      this.STATUS_CONFIG.preparing,
      this.STATUS_CONFIG.ready_for_delivery,
      this.STATUS_CONFIG.out_for_delivery,
      this.STATUS_CONFIG.delivered
    ];
  }

  // Get admin manageable statuses
  static getAdminStatuses(): OrderStatusInfo[] {
    return [
      this.STATUS_CONFIG.confirmed,
      this.STATUS_CONFIG.preparing,
      this.STATUS_CONFIG.ready_for_delivery,
      this.STATUS_CONFIG.out_for_delivery,
      this.STATUS_CONFIG.cancelled
    ];
  }

  // Get delivery agent statuses
  static getDeliveryStatuses(): OrderStatusInfo[] {
    return [
      this.STATUS_CONFIG.ready_for_delivery,
      this.STATUS_CONFIG.out_for_delivery,
      this.STATUS_CONFIG.delivered,
      this.STATUS_CONFIG.failed,
      this.STATUS_CONFIG.returned
    ];
  }

  // Get customer visible statuses
  static getCustomerStatuses(): OrderStatusInfo[] {
    return [
      this.STATUS_CONFIG.pending,
      this.STATUS_CONFIG.confirmed,
      this.STATUS_CONFIG.preparing,
      this.STATUS_CONFIG.out_for_delivery,
      this.STATUS_CONFIG.delivered,
      this.STATUS_CONFIG.cancelled
    ];
  }

  // Calculate estimated delivery time
  static getEstimatedDeliveryTime(currentStatus: OrderStatus): number {
    const config = this.STATUS_CONFIG[currentStatus];
    let totalTime = config.estimatedTime || 0;
    
    // Add time for remaining steps
    const flow = this.getStatusFlow();
    const currentIndex = flow.findIndex(s => s.status === currentStatus);
    
    if (currentIndex >= 0) {
      for (let i = currentIndex + 1; i < flow.length; i++) {
        totalTime += flow[i].estimatedTime || 0;
      }
    }
    
    return totalTime;
  }

  // Get status progress percentage
  static getProgressPercentage(currentStatus: OrderStatus): number {
    const flow = this.getStatusFlow();
    const currentIndex = flow.findIndex(s => s.status === currentStatus);
    
    if (currentIndex === -1) return 0;
    if (currentStatus === 'delivered') return 100;
    
    return Math.round((currentIndex / (flow.length - 1)) * 100);
  }

  // Validate status transition with reason
  static validateTransition(from: OrderStatus, to: OrderStatus): { valid: boolean; reason?: string } {
    if (!this.canTransition(from, to)) {
      return {
        valid: false,
        reason: `Cannot transition from ${this.STATUS_CONFIG[from].label} to ${this.STATUS_CONFIG[to].label}`
      };
    }
    
    // Additional business logic validations
    if (from === 'delivered' && to !== 'delivered') {
      return {
        valid: false,
        reason: 'Cannot change status of delivered order'
      };
    }
    
    if (from === 'cancelled' && to !== 'cancelled') {
      return {
        valid: false,
        reason: 'Cannot change status of cancelled order'
      };
    }
    
    return { valid: true };
  }

  // Get status badge component props
  static getStatusBadgeProps(status: OrderStatus) {
    const config = this.STATUS_CONFIG[status];
    return {
      className: `${config.bgColor} ${config.color} border-0`,
      children: `${config.icon} ${config.label}`
    };
  }

  // Get status timeline for order tracking
  static getStatusTimeline(currentStatus: OrderStatus): Array<{
    status: OrderStatus;
    label: string;
    icon: string;
    completed: boolean;
    active: boolean;
  }> {
    const flow = this.getStatusFlow();
    const currentIndex = flow.findIndex(s => s.status === currentStatus);
    
    return flow.map((statusInfo, index) => ({
      status: statusInfo.status,
      label: statusInfo.label,
      icon: statusInfo.icon,
      completed: index < currentIndex || currentStatus === 'delivered',
      active: index === currentIndex
    }));
  }
}