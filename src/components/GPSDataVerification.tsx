import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationService } from '@/lib/locationService';
import { supabaseApi } from '@/lib/supabase';

const GPSDataVerification = () => {
  const [realGPS, setRealGPS] = useState<any>(null);
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    checkRealGPS();
    checkDatabaseData();
    
    const interval = setInterval(() => {
      checkRealGPS();
      checkDatabaseData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const checkRealGPS = async () => {
    const location = await LocationService.getCurrentLocation();
    if (location) {
      setRealGPS({
        ...location,
        timestamp: new Date().toISOString(),
        source: 'Device GPS'
      });
    }
  };

  const checkDatabaseData = async () => {
    try {
      const agents = await supabaseApi.getDeliveryAgents();
      const activeAgent = agents.find(a => a.current_lat && a.current_lng);
      if (activeAgent) {
        setDatabaseData({
          lat: activeAgent.current_lat,
          lng: activeAgent.current_lng,
          agentId: activeAgent.id,
          lastUpdate: activeAgent.last_location_update,
          source: 'Supabase Database'
        });
      }
    } catch (error) {
      console.error('Database check failed:', error);
    }
  };

  const startTracking = async () => {
    const agentId = 'test_agent_' + Date.now();
    const started = await LocationService.startTracking(agentId);
    setIsTracking(started);
  };

  const stopTracking = () => {
    LocationService.stopTracking();
    setIsTracking(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            🛰️ GPS Data Verification
            <Badge variant={realGPS ? 'default' : 'secondary'}>
              {realGPS ? 'REAL' : 'NO GPS'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Real GPS Data */}
          <div className="p-2 bg-green-50 rounded border">
            <div className="font-medium text-green-800 mb-1">📱 Device GPS:</div>
            {realGPS ? (
              <div className="text-green-700 space-y-1">
                <div>Lat: {realGPS.lat.toFixed(6)}</div>
                <div>Lng: {realGPS.lng.toFixed(6)}</div>
                <div>Accuracy: {realGPS.accuracy ? Math.round(realGPS.accuracy) + 'm' : 'N/A'}</div>
                <div>Time: {new Date(realGPS.timestamp).toLocaleTimeString()}</div>
              </div>
            ) : (
              <div className="text-gray-500">No GPS available</div>
            )}
          </div>

          {/* Database Data */}
          <div className="p-2 bg-blue-50 rounded border">
            <div className="font-medium text-blue-800 mb-1">💾 Database:</div>
            {databaseData ? (
              <div className="text-blue-700 space-y-1">
                <div>Lat: {databaseData.lat.toFixed(6)}</div>
                <div>Lng: {databaseData.lng.toFixed(6)}</div>
                <div>Agent: {databaseData.agentId}</div>
                <div>Updated: {databaseData.lastUpdate ? new Date(databaseData.lastUpdate).toLocaleTimeString() : 'N/A'}</div>
              </div>
            ) : (
              <div className="text-gray-500">No agent data</div>
            )}
          </div>

          {/* Tracking Status */}
          <div className="p-2 bg-yellow-50 rounded border">
            <div className="font-medium text-yellow-800 mb-1">🔄 Tracking:</div>
            <div className="text-yellow-700">
              Status: {isTracking ? 'ACTIVE' : 'STOPPED'}
            </div>
            <div className="mt-2 space-x-2">
              <button 
                onClick={startTracking}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                disabled={isTracking}
              >
                Start
              </button>
              <button 
                onClick={stopTracking}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                disabled={!isTracking}
              >
                Stop
              </button>
            </div>
          </div>

          {/* Data Comparison */}
          {realGPS && databaseData && (
            <div className="p-2 bg-purple-50 rounded border">
              <div className="font-medium text-purple-800 mb-1">📊 Comparison:</div>
              <div className="text-purple-700 space-y-1">
                <div>Distance: {(
                  Math.sqrt(
                    Math.pow(realGPS.lat - databaseData.lat, 2) + 
                    Math.pow(realGPS.lng - databaseData.lng, 2)
                  ) * 111000
                ).toFixed(0)}m</div>
                <div>Match: {
                  Math.abs(realGPS.lat - databaseData.lat) < 0.001 && 
                  Math.abs(realGPS.lng - databaseData.lng) < 0.001 ? 'YES' : 'NO'
                }</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GPSDataVerification;