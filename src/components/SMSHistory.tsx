import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, Phone } from 'lucide-react';
import { FreeSmsService } from '@/lib/freeSmsService';

const SMSHistory = () => {
  const [smsHistory, setSmsHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setSmsHistory(FreeSmsService.getSMSHistory());
    };

    loadHistory();
    const interval = setInterval(loadHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    FreeSmsService.clearSMSHistory();
    setSmsHistory([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS History ({smsHistory.length})
          </CardTitle>
          {smsHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {smsHistory.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No SMS sent yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {smsHistory.reverse().map((sms) => (
              <div key={sms.id} className="border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{sms.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {sms.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sms.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {sms.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSHistory;