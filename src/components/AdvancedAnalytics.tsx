import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, MapPin } from "lucide-react";

const AdvancedAnalytics = () => {
  const salesData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 140 },
    { month: 'Mar', revenue: 48000, orders: 130 },
    { month: 'Apr', revenue: 61000, orders: 165 },
    { month: 'May', revenue: 55000, orders: 150 },
    { month: 'Jun', revenue: 67000, orders: 180 }
  ];

  const deliveryTimes = [
    { area: 'Zone A', avgTime: 25, orders: 45 },
    { area: 'Zone B', avgTime: 32, orders: 38 },
    { area: 'Zone C', avgTime: 28, orders: 52 },
    { area: 'Zone D', avgTime: 35, orders: 29 }
  ];

  const categoryData = [
    { name: 'Groceries', value: 45, color: '#8884d8' },
    { name: 'Vegetables', value: 30, color: '#82ca9d' },
    { name: 'Dairy', value: 15, color: '#ffc658' },
    { name: 'Others', value: 10, color: '#ff7300' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name]} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Delivery Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip formatter={(value, name) => [name === 'avgTime' ? `${value} min` : value, name]} />
              <Bar dataKey="avgTime" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Peak Hours Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '9-11 AM', orders: 45, percentage: 85 },
              { time: '12-2 PM', orders: 62, percentage: 95 },
              { time: '6-8 PM', orders: 78, percentage: 100 },
              { time: '8-10 PM', orders: 34, percentage: 60 }
            ].map((slot) => (
              <div key={slot.time} className="flex items-center justify-between">
                <span className="font-medium">{slot.time}</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${slot.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{slot.orders}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;