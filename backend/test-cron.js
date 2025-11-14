/**
 * Test Cron Jobs Locally
 * This script tests the stock update and portfolio recalculation
 */

import { updateStockPrices, updatePortfolioValues } from './services/stockTracker.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('');
console.log('═══════════════════════════════════════');
console.log('🧪 Testing Cron Jobs');
console.log('═══════════════════════════════════════');
console.log('');

async function testCronJobs() {
  try {
    console.log('🔄 Step 1: Updating stock prices...');
    await updateStockPrices();
    
    console.log('');
    console.log('🔄 Step 2: Updating portfolio values...');
    await updatePortfolioValues();
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ Cron jobs test completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('💡 The cron jobs are working correctly');
    console.log('📊 Stock prices are being updated');
    console.log('💰 Portfolio values are being recalculated');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Cron jobs test failed:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testCronJobs();
