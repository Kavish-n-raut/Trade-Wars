// Script to update stock prices to current market values
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import nifty50Data from './nifty50.js';

const prisma = new PrismaClient();

async function updateStockPrices() {
  try {
    console.log('🔄 Updating stock prices to current market values...');

    for (const stockData of nifty50Data) {
      await prisma.stock.update({
        where: { symbol: stockData.symbol },
        data: {
          currentPrice: stockData.price,
          change: 0,
          changePercent: 0,
        },
      });
      console.log(`✅ Updated ${stockData.symbol}: ₹${stockData.price}`);
    }

    console.log('\n🎉 All stock prices updated successfully!');
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStockPrices();
