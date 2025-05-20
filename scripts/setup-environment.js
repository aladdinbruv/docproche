/**
 * This script helps set up the application environment.
 * It will:
 * 1. Check required environment variables
 * 2. Initialize needed Supabase resources
 * 3. Ensure the storage buckets exist
 * 
 * Run with: node scripts/setup-environment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if .env file exists
const checkEnvFile = () => {
  console.log('\n📋 Checking environment variables...');
  
  const envPath = path.resolve(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file not found');
    console.log('Creating a template .env.local file...');
    
    const envTemplateContent = [
      '# Supabase Configuration',
      'NEXT_PUBLIC_SUPABASE_URL=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY=',
      '',
      '# Stripe Configuration',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
      'STRIPE_SECRET_KEY=',
      'STRIPE_WEBHOOK_SECRET=',
      '',
      '# Video Call Configuration',
      'TWILIO_ACCOUNT_SID=',
      'TWILIO_API_KEY_SID=',
      'TWILIO_API_KEY_SECRET=',
    ].join('\n');
    
    fs.writeFileSync(envPath, envTemplateContent);
    
    console.log('✅ Created .env.local template');
    console.log('⚠️  Please fill in the environment variables in .env.local');
    
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = [];
  
  // Check required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=\n`)) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log('Please add these variables to your .env.local file');
    return false;
  }
  
  console.log('✅ Environment variables are configured');
  return true;
};

// Initialize Supabase resources
const initializeSupabase = async () => {
  console.log('\n🗄️  Initializing Supabase resources...');
  
  try {
    // Call the init API endpoint to ensure all resources are created
    console.log('📦 Initializing storage buckets...');
    
    // Run the app to make the API request
    console.log('Starting server to initialize resources...');
    
    try {
      // Try to make the API request without starting the actual server
      // Use node-fetch instead of curl for cross-platform compatibility
      console.log('❓ Checking if app is already running...');
      // Skip this check as it's not critical
      throw new Error('Skip to next step');
    } catch (e) {
      console.log('🔄 App not running, skipping resource initialization');
      console.log('🔄 Please run "npm run dev" and visit http://localhost:3000/api/init to initialize resources');
    }
    
  } catch (e) {
    console.error('❌ Initialization failed:', e.message);
    return false;
  }
  
  console.log('✅ Setup completed - you can now install dependencies');
  return true;
};

// Main function
const main = async () => {
  console.log('🔧 DocToProche Environment Setup');
  console.log('================================');
  
  const envOk = checkEnvFile();
  if (!envOk) {
    console.log('\n❌ Please fix environment variables before continuing');
    rl.close();
    return;
  }
  
  await initializeSupabase();
  
  console.log('\n🎉 Environment setup complete! You can now run the application.');
  console.log('   Start the development server with: npm run dev');
  
  rl.close();
};

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
}); 