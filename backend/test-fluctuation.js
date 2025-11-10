/**
 * Test 0.1% Stock Price Fluctuation
 * This script verifies that stock prices fluctuate by ~0.1% each update
 */

import { PrismaClient } from '@prisma/client';
import { updateStockPrices, updatePortfolioValues } from './services/stockTracker.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testFluctuation() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 Testing 0.1% Stock Price Fluctuation');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // Get initial prices
    const stocksBefore = await prisma.stock.findMany({
      take: 10,
      orderBy: { symbol: 'asc' }
    });
    
    console.log('📊 BEFORE UPDATE:');
    console.log('─'.repeat(70));
    console.log('Symbol'.padEnd(12) + 'Price'.padStart(12) + '  Change%'.padStart(12));
    console.log('─'.repeat(70));
    stocksBefore.forEach(stock => {
      const symbol = stock.symbol.padEnd(12);
      const price = `₹${stock.currentPrice.toFixed(2)}`.padStart(12);
      const change = `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`.padStart(12);
      console.log(`${symbol}${price}${change}`);
    });
    
    console.log('');
    console.log('🔄 Applying 0.1% random fluctuation...');
    console.log('');
    
    // Update prices
    await updateStockPrices();
    await updatePortfolioValues();
    
    // Get updated prices
    const stocksAfter = await prisma.stock.findMany({
      take: 10,
      orderBy: { symbol: 'asc' }
    });
    
    console.log('📊 AFTER UPDATE:');
    console.log('─'.repeat(70));
    console.log('Symbol'.padEnd(12) + 'Price'.padStart(12) + '  Change'.padStart(12) + '  %Diff'.padStart(12));
    console.log('─'.repeat(70));
    
    let totalPercentChange = 0;
    stocksAfter.forEach((stock, idx) => {
      const before = stocksBefore[idx];
      const priceDiff = stock.currentPrice - before.currentPrice;
      const percentDiff = ((priceDiff / before.currentPrice) * 100);
      totalPercentChange += Math.abs(percentDiff);
      
      const symbol = stock.symbol.padEnd(12);
      const price = `₹${stock.currentPrice.toFixed(2)}`.padStart(12);
      const diff = `${priceDiff >= 0 ? '+' : ''}₹${priceDiff.toFixed(2)}`.padStart(12);
      const percent = `${percentDiff >= 0 ? '+' : ''}${percentDiff.toFixed(4)}%`.padStart(12);
      
      console.log(`${symbol}${price}${diff}${percent}`);
    });
    
    const avgPercentChange = totalPercentChange / stocksAfter.length;
    
    console.log('─'.repeat(70));
    console.log('');
    console.log('📈 Statistics:');
    console.log(`   Average absolute change: ${avgPercentChange.toFixed(4)}%`);
    console.log(`   Expected range: 0% to 0.1%`);
    console.log(`   Status: ${avgPercentChange <= 0.1 ? '✅ PASS' : '⚠️ WARNING'}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Fluctuation test completed!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Each update applies a random fluctuation between -0.1% and +0.1%');
    console.log('📊 Run this multiple times to see different random variations');
    console.log('⏱️  In production, this runs every 1 minute via Vercel Cron');
    console.log('🔧 In development, this runs every 30 seconds via setInterval');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Fluctuation test failed:', error.message);
    console.error('');
  } finally {
    await prisma.$disconnect();
  }
}

testFluctuation();
