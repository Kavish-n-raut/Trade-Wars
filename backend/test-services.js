import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import stockApi from './services/stockApi.js';
import stockTracker from './services/stockTracker.js';
import newsService from './services/newsService.js';

dotenv.config();
const prisma = new PrismaClient();

console.log('🧪 Testing Backend Services\n');

async function testStockApi() {
  console.log('📊 Test 1: Stock API Service');
  console.log('='.repeat(50));
  
  try {
    // Test single stock
    console.log('\n1️⃣  Testing single stock fetch (RELIANCE)...');
    const reliance = await stockApi.fetchStockPrice('RELIANCE');
    console.log('Result:', reliance);
    
    // Test multiple stocks
    console.log('\n2️⃣  Testing batch fetch (5 stocks)...');
    const symbols = ['TCS', 'INFY', 'HDFC', 'ICICIBANK', 'ITC'];
    const results = await stockApi.fetchMultipleStocks(symbols);
    console.log('Results:', Object.keys(results).length, 'stocks fetched');
    
    // Show cache stats
    console.log('\n3️⃣  Cache statistics:');
    console.log(stockApi.getCacheStats());
    
    console.log('\n✅ Stock API Test: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ Stock API Test: FAILED');
    console.error(error);
    return false;
  }
}

async function testStockTracker() {
  console.log('📈 Test 2: Stock Tracker Service');
  console.log('='.repeat(50));
  
  try {
    // Check if stocks exist in database
    const stockCount = await prisma.stock.count();
    console.log(`\n1️⃣  Stocks in database: ${stockCount}`);
    
    if (stockCount === 0) {
      console.log('⚠️  No stocks found. Run seed first: npx prisma migrate reset --force');
      return false;
    }
    
    // Test single stock update
    console.log('\n2️⃣  Testing single stock update...');
    const testStock = await prisma.stock.findFirst();
    const updated = await stockTracker.updateSingleStock(testStock.symbol);
    console.log(`Updated ${testStock.symbol}:`, {
      apiPrice: updated?.apiPrice,
      currentPrice: updated?.currentPrice,
      changePercent: updated?.changePercent
    });
    
    console.log('\n✅ Stock Tracker Test: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ Stock Tracker Test: FAILED');
    console.error(error);
    return false;
  }
}

async function testNewsService() {
  console.log('📰 Test 3: News Service');
  console.log('='.repeat(50));
  
  try {
    // Test single news fetch
    console.log('\n1️⃣  Testing news fetch for Reliance...');
    const news = await newsService.fetchStockNews('RELIANCE', 'Reliance Industries');
    console.log(`Found ${news.length} articles`);
    if (news.length > 0) {
      console.log('Latest article:', news[0].title);
    }
    
    // Check news stats
    console.log('\n2️⃣  News service statistics:');
    console.log(newsService.getStats());
    
    console.log('\n✅ News Service Test: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ News Service Test: FAILED');
    console.error(error);
    return false;
  }
}

async function testPriceCalculation() {
  console.log('🧮 Test 4: Price Calculation with Manual Offset');
  console.log('='.repeat(50));
  
  try {
    const stock = await prisma.stock.findFirst();
    
    console.log('\n1️⃣  Original stock data:');
    console.log(`   Symbol: ${stock.symbol}`);
    console.log(`   API Price: ₹${stock.apiPrice}`);
    console.log(`   Manual Offset: ₹${stock.manualOffset}`);
    console.log(`   Current Price: ₹${stock.currentPrice}`);
    
    // Update with manual offset
    console.log('\n2️⃣  Applying manual offset of +100...');
    const updated = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        manualOffset: 100,
        currentPrice: stock.apiPrice + 100,
      },
    });
    
    console.log(`   New Current Price: ₹${updated.currentPrice}`);
    console.log(`   Calculation: ${updated.apiPrice} + ${updated.manualOffset} = ${updated.currentPrice}`);
    
    // Reset offset
    await prisma.stock.update({
      where: { id: stock.id },
      data: {
        manualOffset: 0,
        currentPrice: stock.apiPrice,
      },
    });
    
    console.log('\n✅ Price Calculation Test: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ Price Calculation Test: FAILED');
    console.error(error);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BACKEND SERVICES TEST SUITE');
  console.log('='.repeat(60) + '\n');
  
  const results = {
    stockApi: await testStockApi(),
    stockTracker: await testStockTracker(),
    newsService: await testNewsService(),
    priceCalculation: await testPriceCalculation(),
  };
  
  console.log('='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Stock API:          ${results.stockApi ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stock Tracker:      ${results.stockTracker ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`News Service:       ${results.newsService ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Price Calculation:  ${results.priceCalculation ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is ready.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check errors above.');
  }
  
  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

runAllTests();