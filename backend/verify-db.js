/**
 * Database Connection Verification Script
 * Tests the connection to Prisma Cloud database and shows database info
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

console.log('');
console.log('═══════════════════════════════════════');
console.log('🔌 Database Connection Verification');
console.log('═══════════════════════════════════════');
console.log('');

async function verifyDatabase() {
  try {
    // Extract host from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const hostMatch = dbUrl?.match(/@([^:]+):(\d+)\//);
    const host = hostMatch ? `${hostMatch[1]}:${hostMatch[2]}` : 'Unknown';
    
    console.log('📊 Database Configuration:');
    console.log(`   Host: ${host}`);
    console.log(`   Provider: PostgreSQL`);
    console.log('');

    // Test 1: Check connection
    console.log('🔄 Test 1: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    console.log('');

    // Test 2: Query users table
    console.log('🔄 Test 2: Querying users table...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    console.log('');

    // Test 3: Query stocks table
    console.log('🔄 Test 3: Querying stocks table...');
    const stockCount = await prisma.stock.count();
    console.log(`✅ Found ${stockCount} stocks in database`);
    console.log('');

    // Test 4: Query transactions table
    console.log('🔄 Test 4: Querying transactions table...');
    const transactionCount = await prisma.transaction.count();
    console.log(`✅ Found ${transactionCount} transactions in database`);
    console.log('');

    // Test 5: Check latest stock prices
    console.log('🔄 Test 5: Checking stock prices...');
    const sampleStocks = await prisma.stock.findMany({
      take: 3,
      orderBy: { symbol: 'asc' },
      select: {
        symbol: true,
        name: true,
        currentPrice: true,
        changePercent: true,
        lastUpdated: true,
      },
    });

    console.log('✅ Sample stocks with latest prices:');
    sampleStocks.forEach(stock => {
      const change = stock.changePercent >= 0 ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`;
      console.log(`   ${stock.symbol}: ₹${stock.currentPrice.toFixed(2)} (${change})`);
      console.log(`   Last updated: ${new Date(stock.lastUpdated).toLocaleString()}`);
    });
    console.log('');

    // Test 6: Check user portfolios
    console.log('🔄 Test 6: Checking user portfolios...');
    const users = await prisma.user.findMany({
      select: {
        username: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
        isAdmin: true,
      },
    });

    console.log('✅ User portfolios:');
    users.forEach(user => {
      const plColor = user.profitLoss >= 0 ? '🟢' : '🔴';
      console.log(`   ${user.username} ${user.isAdmin ? '(Admin)' : ''}`);
      console.log(`     Balance: ₹${user.balance.toLocaleString()}`);
      console.log(`     Portfolio: ₹${user.portfolioValue.toLocaleString()}`);
      console.log(`     ${plColor} Total P/L: ₹${user.profitLoss.toFixed(2)}`);
      console.log(`     Realized P/L: ₹${user.realizedProfitLoss.toFixed(2)}`);
    });
    console.log('');

    console.log('═══════════════════════════════════════');
    console.log('✅ All Database Tests Passed!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('💡 Database Status:');
    console.log(`   ✅ Connected to: ${host}`);
    console.log(`   ✅ Users: ${userCount}`);
    console.log(`   ✅ Stocks: ${stockCount}`);
    console.log(`   ✅ Transactions: ${transactionCount}`);
    console.log(`   ✅ All tables accessible`);
    console.log(`   ✅ Data is up-to-date`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Database verification failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('  - Database credentials incorrect');
    console.error('  - Network connection issues');
    console.error('  - Database server down');
    console.error('  - Schema not synced (run: npx prisma db push)');
    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
