/**
 * Comprehensive Profit/Loss Verification
 * This script verifies all P/L calculations are correct across the system
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verifyProfitLoss() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 Comprehensive Profit/Loss Verification');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    const users = await prisma.user.findMany({
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    for (const user of users) {
      console.log('─'.repeat(70));
      console.log(`👤 User: ${user.username} (ID: ${user.id})`);
      console.log('─'.repeat(70));
      console.log('');
      
      // 1. Calculate realized P/L from transactions
      let calculatedRealizedPL = 0;
      const sellTransactions = user.transactions.filter(t => t.type === 'sell');
      
      if (sellTransactions.length > 0) {
        console.log('📊 REALIZED P/L (From Past Sales):');
        sellTransactions.forEach(tx => {
          calculatedRealizedPL += tx.profitLoss || 0;
          console.log(`   ${tx.stock_symbol}: ${tx.profitLoss >= 0 ? '+' : ''}₹${tx.profitLoss?.toFixed(2)} (Qty: ${tx.quantity})`);
        });
        console.log(`   Total Calculated: ₹${calculatedRealizedPL.toFixed(2)}`);
        console.log(`   DB Value: ₹${user.realizedProfitLoss.toFixed(2)}`);
        
        const realizedMatch = Math.abs(calculatedRealizedPL - user.realizedProfitLoss) < 0.01;
        console.log(`   Status: ${realizedMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      } else {
        console.log('📊 REALIZED P/L: ₹0.00 (No sales yet)');
      }
      
      console.log('');
      
      // 2. Calculate unrealized P/L from current holdings
      let calculatedUnrealizedPL = 0;
      let totalInvested = 0;
      let totalCurrentValue = 0;
      
      if (user.holdings.length > 0) {
        console.log('📈 UNREALIZED P/L (Current Holdings):');
        user.holdings.forEach(holding => {
          const invested = holding.quantity * holding.averagePrice;
          const currentValue = holding.quantity * holding.stock.currentPrice;
          const holdingPL = currentValue - invested;
          
          calculatedUnrealizedPL += holdingPL;
          totalInvested += invested;
          totalCurrentValue += currentValue;
          
          const plPercent = (holdingPL / invested) * 100;
          console.log(`   ${holding.stock.symbol}: ${holdingPL >= 0 ? '+' : ''}₹${holdingPL.toFixed(2)} (${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%)`);
          console.log(`      Qty: ${holding.quantity}, Avg: ₹${holding.averagePrice.toFixed(2)}, Current: ₹${holding.stock.currentPrice.toFixed(2)}`);
        });
        console.log(`   Total Unrealized: ₹${calculatedUnrealizedPL.toFixed(2)}`);
      } else {
        console.log('📈 UNREALIZED P/L: ₹0.00 (No holdings)');
      }
      
      console.log('');
      
      // 3. Calculate total P/L
      const calculatedTotalPL = calculatedRealizedPL + calculatedUnrealizedPL;
      console.log('💰 TOTAL PROFIT/LOSS:');
      console.log(`   Realized: ₹${calculatedRealizedPL.toFixed(2)}`);
      console.log(`   Unrealized: ₹${calculatedUnrealizedPL.toFixed(2)}`);
      console.log(`   Total Calculated: ₹${calculatedTotalPL.toFixed(2)}`);
      console.log(`   DB Value: ₹${user.profitLoss.toFixed(2)}`);
      
      const totalMatch = Math.abs(calculatedTotalPL - user.profitLoss) < 0.01;
      console.log(`   Status: ${totalMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      
      console.log('');
      
      // 4. Verify portfolio value
      const calculatedPortfolioValue = user.balance + totalCurrentValue;
      console.log('💼 PORTFOLIO VALUE:');
      console.log(`   Cash Balance: ₹${user.balance.toFixed(2)}`);
      console.log(`   Holdings Value: ₹${totalCurrentValue.toFixed(2)}`);
      console.log(`   Total Calculated: ₹${calculatedPortfolioValue.toFixed(2)}`);
      console.log(`   DB Value: ₹${user.portfolioValue.toFixed(2)}`);
      
      const portfolioMatch = Math.abs(calculatedPortfolioValue - user.portfolioValue) < 0.01;
      console.log(`   Status: ${portfolioMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
      
      console.log('');
      
      // Overall status
      const allMatch = (sellTransactions.length === 0 || realizedMatch) && totalMatch && portfolioMatch;
      console.log(`🎯 Overall Status: ${allMatch ? '✅ ALL CALCULATIONS CORRECT' : '❌ ISSUES FOUND'}`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Profit/Loss verification completed!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📌 Key Points:');
    console.log('   • Realized P/L = Sum of all sell transaction profits/losses');
    console.log('   • Unrealized P/L = (Current Value - Average Cost) for holdings');
    console.log('   • Total P/L = Realized + Unrealized');
    console.log('   • Portfolio Value = Cash Balance + Holdings Value');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Verification failed:', error.message);
    console.error('');
  } finally {
    await prisma.$disconnect();
  }
}

verifyProfitLoss();
