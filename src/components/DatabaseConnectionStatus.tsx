import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseService, isSupabaseEnabled } from "@/lib/databaseService";
import { Database, Cloud, HardDrive } from "lucide-react";

const DatabaseConnectionStatus = () => {
  const isProduction = isSupabaseEnabled();
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Database Connection
        </CardTitle>
        <CardDescription>Current database configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            isProduction 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center gap-3">
              {isProduction ? (
                <Cloud className="h-6 w-6 text-green-600" />
              ) : (
                <HardDrive className="h-6 w-6 text-orange-600" />
              )}
              <div>
                <div className="font-semibold text-gray-800">
                  {isProduction ? 'Supabase PostgreSQL' : 'Local MySQL'}
                </div>
                <div className="text-sm text-gray-600">
                  {isProduction ? 'Production Database' : 'Development Database'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={`${
              isProduction ? 'bg-green-500' : 'bg-orange-500'
            } text-white`}>
              {isProduction ? 'Production Ready' : 'Development Mode'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Real-time:</span>
            <Badge variant={isProduction ? "default" : "secondary"}>
              {isProduction ? 'Enabled' : 'Limited'}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            {isProduction 
              ? 'Connected to Supabase with real-time subscriptions and PostgreSQL features'
              : 'Using local MySQL for development. Add Supabase credentials to enable production features.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionStatus;