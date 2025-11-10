#!/usr/bin/env node

/**
 * Trade Wars - Setup and Deployment Script
 * This script helps initialize the database and start the server
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('');
console.log('═══════════════════════════════════════');
console.log('🚀 Trade Wars - Setup & Deployment');
console.log('═══════════════════════════════════════');
console.log('');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please create a .env file with your database credentials');
  console.log('   You can copy .env.example and update the values');
  process.exit(1);
}

console.log('✅ .env file found');

// Function to run command
function runCommand(command, description) {
  console.log('');
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

// Main setup process
async function setup() {
  console.log('');
  console.log('📦 Step 1: Installing dependencies');
  if (!runCommand('npm install', 'Installing packages')) {
    process.exit(1);
  }

  console.log('');
  console.log('🗄️  Step 2: Setting up database');
  
  // Generate Prisma Client
  if (!runCommand('npx prisma generate', 'Generating Prisma Client')) {
    process.exit(1);
  }

  // Run migrations
  console.log('');
  console.log('🔄 Running database migrations...');
  console.log('   This will create all tables and apply updates');
  if (!runCommand('npx prisma migrate dev --name init', 'Database migration')) {
    console.log('⚠️  Migration failed. Trying deploy instead...');
    if (!runCommand('npx prisma migrate deploy', 'Database migration (deploy)')) {
      console.log('❌ Database setup failed');
      console.log('💡 Make sure your DATABASE_URL in .env is correct');
      process.exit(1);
    }
  }

  // Seed database
  console.log('');
  console.log('🌱 Step 3: Seeding database with initial data');
  if (!runCommand('npx prisma db seed', 'Database seeding')) {
    console.log('⚠️  Seeding failed or already seeded');
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ Setup completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Start backend: npm run dev');
  console.log('   2. Start frontend: cd ../frontend && npm run dev');
  console.log('');
  console.log('📡 API will be available at: http://localhost:3000/api');
  console.log('🌐 Frontend will be at: http://localhost:5173');
  console.log('');
  console.log('📊 The stock prices will update automatically every 30 seconds');
  console.log('');
}

setup().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
