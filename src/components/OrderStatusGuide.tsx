import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusService } from "@/lib/orderStatusService";

const OrderStatusGuide = () => {
  const statusFlow = OrderStatusService.getStatusFlow();
  const allStatuses = OrderStatusService.getAllStatuses();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Status Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Standard order progression from placement to delivery:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {statusFlow.map((status, index) => (
                <div key={status.status} className="flex items-center">
                  <Badge className={`${status.bgColor} ${status.color} px-3 py-1`}>
                    {status.icon} {status.label}
                  </Badge>
                  {index < statusFlow.length - 1 && (
                    <div className="mx-2 text-gray-400">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Status Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {allStatuses.map((status) => (
              <div key={status.status} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${status.bgColor} ${status.color}`}>
                    {status.icon} {status.label}
                  </Badge>
                  {status.isTerminal && (
                    <Badge variant="outline" className="text-xs">
                      Final
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{status.description}</p>
                {status.estimatedTime && (
                  <p className="text-xs text-gray-500">
                    Est. time: {status.estimatedTime} minutes
                  </p>
                )}
                {status.canTransitionTo.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Can transition to:</p>
                    <div className="flex flex-wrap gap-1">
                      {status.canTransitionTo.map((nextStatus) => (
                        <Badge key={nextStatus} variant="outline" className="text-xs">
                          {OrderStatusService.getStatusInfo(nextStatus).label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusGuide;