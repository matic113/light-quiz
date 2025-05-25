#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environments = {
  local: {
    production: false,
    apiUrl: 'https://localhost:5001',
    apiHost: 'https://localhost:5001/api'
  },
  staging: {
    production: false,
    apiUrl: 'https://staging-api.theknight.tech',
    apiHost: 'https://staging-api.theknight.tech/api'
  },
  production: {
    production: true,
    apiUrl: 'https://api.theknight.tech',
    apiHost: 'https://api.theknight.tech/api'
  }
};

function generateEnvironmentFile(config) {
  return `export const environment = ${JSON.stringify(config, null, 2)};`;
}

function switchEnvironment(envName) {
  if (!environments[envName]) {
    console.error(`❌ Environment "${envName}" not found.`);
    console.log('Available environments:', Object.keys(environments).join(', '));
    process.exit(1);
  }

  const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
  const envContent = generateEnvironmentFile(environments[envName]);

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Switched to ${envName} environment`);
    console.log(`📍 API URL: ${environments[envName].apiUrl}`);
  } catch (error) {
    console.error('❌ Error writing environment file:', error.message);
    process.exit(1);
  }
}

// Get command line argument
const envName = process.argv[2];

if (!envName) {
  console.log('🔧 Environment Switcher');
  console.log('Usage: node scripts/switch-env.js <environment>');
  console.log('');
  console.log('Available environments:');
  Object.keys(environments).forEach(env => {
    console.log(`  - ${env}: ${environments[env].apiUrl}`);
  });
  process.exit(1);
}

switchEnvironment(envName); 