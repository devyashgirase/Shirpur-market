#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * Checks all critical components before deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 VERCEL DEPLOYMENT VERIFICATION');
console.log('==================================\n');

let allChecks = true;

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables...');
const envFile = '.env.production';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_RAZORPAY_KEY_ID'
  ];
  
  let envChecks = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`)) {
      console.log(`   ✅ ${varName} - Present`);
    } else {
      console.log(`   ❌ ${varName} - Missing or empty`);
      envChecks = false;
    }
  });
  
  if (envChecks) {
    console.log('   ✅ All environment variables configured\n');
  } else {
    console.log('   ❌ Some environment variables missing\n');
    allChecks = false;
  }
} else {
  console.log('   ❌ .env.production file not found\n');
  allChecks = false;
}

// Check 2: Package.json
console.log('2️⃣ Checking Package Configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.scripts['build:prod']) {
  console.log('   ✅ Production build script exists');
} else {
  console.log('   ❌ Production build script missing');
  allChecks = false;
}

if (packageJson.dependencies['@supabase/supabase-js']) {
  console.log('   ✅ Supabase client installed');
} else {
  console.log('   ❌ Supabase client missing');
  allChecks = false;
}

if (packageJson.dependencies['react'] && packageJson.dependencies['react-dom']) {
  console.log('   ✅ React dependencies present');
} else {
  console.log('   ❌ React dependencies missing');
  allChecks = false;
}
console.log('');

// Check 3: Vercel Configuration
console.log('3️⃣ Checking Vercel Configuration...');
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercelConfig.framework === 'vite') {
    console.log('   ✅ Vercel framework set to Vite');
  } else {
    console.log('   ❌ Vercel framework not set to Vite');
    allChecks = false;
  }
  
  if (vercelConfig.buildCommand && vercelConfig.buildCommand.includes('build:prod')) {
    console.log('   ✅ Production build command configured');
  } else {
    console.log('   ❌ Production build command not configured');
    allChecks = false;
  }
  
  if (vercelConfig.outputDirectory === 'dist') {
    console.log('   ✅ Output directory set to dist');
  } else {
    console.log('   ❌ Output directory not set to dist');
    allChecks = false;
  }
} else {
  console.log('   ❌ vercel.json not found');
  allChecks = false;
}
console.log('');

// Check 4: Critical Files
console.log('4️⃣ Checking Critical Files...');
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/lib/supabase.ts',
  'src/components/PaymentGateway.tsx',
  'index.html',
  'vite.config.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} - Present`);
  } else {
    console.log(`   ❌ ${file} - Missing`);
    allChecks = false;
  }
});
console.log('');

// Check 5: Build Output
console.log('5️⃣ Checking Build Output...');
if (fs.existsSync('dist')) {
  if (fs.existsSync('dist/index.html')) {
    console.log('   ✅ Build output exists');
    console.log('   ✅ index.html generated');
  } else {
    console.log('   ❌ index.html not found in build output');
    allChecks = false;
  }
  
  const assetsDir = 'dist/assets';
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const hasJS = assets.some(file => file.endsWith('.js'));
    const hasCSS = assets.some(file => file.endsWith('.css'));
    
    if (hasJS) {
      console.log('   ✅ JavaScript assets generated');
    } else {
      console.log('   ❌ JavaScript assets missing');
      allChecks = false;
    }
    
    if (hasCSS) {
      console.log('   ✅ CSS assets generated');
    } else {
      console.log('   ❌ CSS assets missing');
      allChecks = false;
    }
  } else {
    console.log('   ❌ Assets directory missing');
    allChecks = false;
  }
} else {
  console.log('   ❌ Build output directory (dist) not found');
  console.log('   ℹ️  Run "npm run build:prod" first');
  allChecks = false;
}
console.log('');

// Check 6: Route Configuration
console.log('6️⃣ Checking Route Configuration...');
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const routes = ['/customer', '/admin', '/delivery'];
let routeChecks = true;

routes.forEach(route => {
  if (appTsx.includes(`path="${route}"`)) {
    console.log(`   ✅ ${route} route configured`);
  } else {
    console.log(`   ❌ ${route} route missing`);
    routeChecks = false;
  }
});

if (routeChecks) {
  console.log('   ✅ All main routes configured');
} else {
  console.log('   ❌ Some routes missing');
  allChecks = false;
}
console.log('');

// Check 7: Public Assets
console.log('7️⃣ Checking Public Assets...');
const publicAssets = ['public/favicon.ico', 'public/_redirects'];
publicAssets.forEach(asset => {
  if (fs.existsSync(asset)) {
    console.log(`   ✅ ${asset} - Present`);
  } else {
    console.log(`   ⚠️  ${asset} - Missing (optional)`);
  }
});
console.log('');

// Final Result
console.log('📋 DEPLOYMENT READINESS SUMMARY');
console.log('===============================');

if (allChecks) {
  console.log('🎉 ALL CHECKS PASSED! Your project is ready for Vercel deployment.');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Add environment variables in Vercel dashboard:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('   - VITE_RAZORPAY_KEY_ID');
  console.log('   - VITE_ENABLE_LOYALTY_PROGRAM=true');
  console.log('   - VITE_ENABLE_ROUTE_OPTIMIZATION=true');
  console.log('   - VITE_ENABLE_SMART_INVENTORY=true');
  console.log('   - VITE_ENABLE_FEEDBACK_SYSTEM=true');
  console.log('   - VITE_ENABLE_ADVANCED_ANALYTICS=true');
  console.log('4. Deploy!');
  console.log('');
  console.log('🌐 Your app will be available at:');
  console.log('   - Customer: https://your-app.vercel.app/customer');
  console.log('   - Admin: https://your-app.vercel.app/admin');
  console.log('   - Delivery: https://your-app.vercel.app/delivery');
} else {
  console.log('❌ SOME CHECKS FAILED! Please fix the issues above before deploying.');
  console.log('');
  console.log('🔧 Common fixes:');
  console.log('1. Run "npm run build:prod" to generate build output');
  console.log('2. Check .env.production file has all required variables');
  console.log('3. Ensure all critical files are present');
}

console.log('');
process.exit(allChecks ? 0 : 1);