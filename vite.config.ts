import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['fsevents']
  },
  define: {
    global: 'globalThis',
    // Explicitly define environment variables for production
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://rfzviddearsabuxyfslg.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmenZpZGRlYXJzYWJ1eHlmc2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzMyNzYsImV4cCI6MjA3NTE0OTI3Nn0.4_GX9Rd1u03jut9EpX-TjAEC5Nkmhtw15y0xpvjfeP8'),
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify('rzp_test_1DP5mmOlF5G5ag'),
  }
};
});
