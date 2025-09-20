import { TestSMSComponent } from '@/components/TestSMSComponent';

export default function TestSMSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 Test SMS Service</h1>
          <p className="text-gray-600">Send a real SMS to your mobile phone right now!</p>
        </div>
        
        <TestSMSComponent />
        
        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold">Instant Delivery</h3>
              <p className="text-gray-600">SMS delivered in seconds</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🆓</div>
              <h3 className="font-semibold">Free Service</h3>
              <p className="text-gray-600">No cost for testing</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold">Global Reach</h3>
              <p className="text-gray-600">Works worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}