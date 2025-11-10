// Data flow debugger
export const dataDebugger = {
  logDataSave: (type: string, data: any, location: 'supabase' | 'localStorage') => {
    console.log(`🔍 [${type.toUpperCase()}] Data saved to:`, location);
    console.log(`📦 Data:`, data);
    console.log(`⏰ Time:`, new Date().toLocaleString());
    
    // Show in UI as well
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${location === 'supabase' ? '#10b981' : '#f59e0b'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      notification.innerHTML = `
        ${location === 'supabase' ? '✅' : '💾'} ${type} saved to ${location}
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  },

  checkSupabaseConnection: async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.log('❌ Supabase credentials missing');
      return false;
    }
    
    try {
      const response = await fetch(`${url}/rest/v1/products?limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      
      const isConnected = response.ok;
      console.log(isConnected ? '✅ Supabase connected' : '❌ Supabase connection failed');
      return isConnected;
    } catch (error) {
      console.log('❌ Supabase connection error:', error);
      return false;
    }
  }
};