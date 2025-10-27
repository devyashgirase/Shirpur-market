import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusService, OrderStatus } from "@/lib/orderStatusService";

interface OrderStatusFlowProps {
  currentStatus: OrderStatus;
  showDescription?: boolean;
  showTimeline?: boolean;
}

const OrderStatusFlow = ({ currentStatus, showDescription = true, showTimeline = false }: OrderStatusFlowProps) => {
  const statusFlow = OrderStatusService.getStatusFlow();
  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);
  const progressPercentage = OrderStatusService.getProgressPercentage(currentStatus);

  if (showTimeline) {
    const timeline = OrderStatusService.getStatusTimeline(currentStatus);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Progress</CardTitle>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step.completed ? 'bg-green-500 text-white' :
                  step.active ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? '✓' : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.active ? 'text-blue-600' : 
                    step.completed ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.active && showDescription && (
                    <p className="text-sm text-gray-600">
                      {OrderStatusService.getStatusInfo(step.status).description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Status Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFlow.map((status, index) => {
            const isCurrent = status.status === currentStatus;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;
            
            return (
              <div key={status.status} className="flex items-center">
                <Badge 
                  className={`${
                    isCurrent ? 'bg-blue-500 text-white border-blue-500' :
                    isPast ? 'bg-green-500 text-white border-green-500' :
                    'bg-gray-200 text-gray-600 border-gray-300'
                  } px-3 py-1`}
                >
                  {status.icon} {status.label}
                </Badge>
                {index < statusFlow.length - 1 && (
                  <div className={`mx-2 w-4 h-0.5 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {showDescription && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Status:</strong> {OrderStatusService.getStatusInfo(currentStatus).description}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Estimated time remaining: {OrderStatusService.getEstimatedDeliveryTime(currentStatus)} minutes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStatusFlow;