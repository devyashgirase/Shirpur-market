// Simple toast replacement - no external dependencies
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
  info: (message: string) => alert(`ℹ️ ${message}`)
};

const Toaster = () => {
  return null; // No UI component needed
};

export { Toaster, toast };
