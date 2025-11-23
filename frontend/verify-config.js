const fs = require('fs');
const path = require('path');

// Configuration Verification Script
// This script verifies that config.json is properly configured
// Run with: node verify-config.js

console.log('🔍 JeevesBot Frontend Configuration Verification\n');

// Check if config.json exists
const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  console.log('❌ config.json not found!');
  console.log('💡 Copy config.example.json to config.json and update with your values');
  process.exit(1);
}

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('✅ config.json found and valid JSON');
  console.log(`📋 Application: ${config.name} v${config.version}`);
  console.log(`📝 Description: ${config.description}\n`);

  // Check required sections
  const requiredSections = ['environment', 'authentication', 'app', 'api'];
  const missingSections = requiredSections.filter(section => !config[section]);

  if (missingSections.length > 0) {
    console.log('❌ Missing required configuration sections:');
    missingSections.forEach(section => console.log(`   - ${section}`));
    process.exit(1);
  }

  console.log('✅ All required configuration sections present\n');

  // Check environment configurations
  console.log('🌍 Environment Configurations:');
  const environments = ['development', 'production', 'staging'];

  environments.forEach(env => {
    const envConfig = config.environment[env];
    if (envConfig) {
      console.log(`\n   ${env.toUpperCase()}:`);
      console.log(`     - BACKEND_URL: ${envConfig.BACKEND_URL}`);
      console.log(`     - APP_NAME: ${envConfig.APP_NAME}`);
      console.log(`     - NODE_ENV: ${envConfig.NODE_ENV}`);
    } else {
      console.log(`\n   ❌ ${env.toUpperCase()}: Missing environment configuration`);
    }
  });

  // Check authentication
  console.log('\n🔐 Authentication Configuration:');
  const auth = config.authentication.backendCredentials;
  if (auth && auth.username && auth.password) {
    console.log(`   ✅ Username: ${auth.username}`);
    console.log(`   ✅ Password: ${'*'.repeat(auth.password.length)}`);
    console.log(`   📝 Note: ${auth.note || 'No note provided'}`);
  } else {
    console.log('   ❌ Authentication configuration incomplete');
  }

  // Check API endpoints
  console.log('\n🌐 API Configuration:');
  const api = config.api;
  if (api && api.endpoints && api.endpoints.appointments) {
    console.log(`   ✅ Appointments endpoints configured`);
    console.log(`   ⏱️  Timeout: ${api.timeout}ms`);
    console.log(`   🔄 Retry attempts: ${api.retryAttempts}`);
  } else {
    console.log('   ❌ API configuration incomplete');
  }

  // Check app configuration
  console.log('\n📱 App Configuration:');
  const app = config.app;
  if (app) {
    console.log(`   ✅ Name: ${app.name}`);
    console.log(`   ✅ Description: ${app.description}`);
    console.log(`   ✅ Version: ${app.version}`);
    console.log(`   🎨 Theme: ${app.theme.primaryColor}`);
  } else {
    console.log('   ❌ App configuration incomplete');
  }

  // Configuration notes
  if (config.notes && config.notes.length > 0) {
    console.log('\n📝 Configuration Notes:');
    config.notes.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note}`);
    });
  }

  console.log('\n💡 Tips:');
  console.log('- Update BACKEND_URL in production environment to your actual backend domain');
  console.log('- Ensure authentication credentials match your backend config.json');
  console.log('- The application automatically detects environment based on hostname');
  console.log('- Run "npm run build" to create a production build');
  console.log('- Deploy the "out/" folder to your web server\n');

  console.log('✅ Configuration verification complete!');

} catch (error) {
  console.log('❌ Error reading config.json:');
  console.log(`   ${error.message}`);
  console.log('💡 Check that config.json contains valid JSON syntax');
  process.exit(1);
}
