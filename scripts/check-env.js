#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment configuration...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envProdPath = path.join(process.cwd(), '.env.production');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const config = {};
lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    config[key.trim()] = value.trim();
  }
});

console.log('📋 Environment Configuration:');
console.log('================================');

// Check Supabase configuration
const hasSupabase = config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY;
console.log(`🗄️  Database: ${hasSupabase ? 'Supabase (Production)' : 'MySQL (Development)'}`);

if (hasSupabase) {
  console.log(`   ✅ Supabase URL: ${config.VITE_SUPABASE_URL}`);
  console.log(`   ✅ Supabase Key: ${config.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`);
} else {
  console.log('   ⚠️  Supabase not configured - using local MySQL');
  console.log('   💡 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production');
}

// Check payment configuration
const hasRazorpay = config.VITE_RAZORPAY_KEY_ID;
console.log(`💳 Payment: ${hasRazorpay ? 'Razorpay Configured' : 'Not Configured'}`);

if (hasRazorpay) {
  console.log(`   ✅ Razorpay Key: ${config.VITE_RAZORPAY_KEY_ID}`);
} else {
  console.log('   ⚠️  Add VITE_RAZORPAY_KEY_ID for payment functionality');
}

// Check feature flags
console.log('\n🚀 Feature Flags:');
const features = [
  'VITE_ENABLE_LOYALTY_PROGRAM',
  'VITE_ENABLE_ROUTE_OPTIMIZATION',
  'VITE_ENABLE_SMART_INVENTORY',
  'VITE_ENABLE_FEEDBACK_SYSTEM',
  'VITE_ENABLE_ADVANCED_ANALYTICS'
];

features.forEach(feature => {
  const enabled = config[feature] === 'true';
  console.log(`   ${enabled ? '✅' : '❌'} ${feature.replace('VITE_ENABLE_', '')}: ${enabled ? 'Enabled' : 'Disabled'}`);
});

// Production readiness check
console.log('\n🎯 Production Readiness:');
const isProductionReady = hasSupabase && hasRazorpay;
console.log(`   ${isProductionReady ? '✅' : '❌'} ${isProductionReady ? 'Ready for production deployment' : 'Missing required configuration'}`);

if (!isProductionReady) {
  console.log('\n📝 To make production ready:');
  if (!hasSupabase) {
    console.log('   1. Set up Supabase project and add credentials');
  }
  if (!hasRazorpay) {
    console.log('   2. Configure Razorpay payment gateway');
  }
}

console.log('\n✨ Environment check complete!');