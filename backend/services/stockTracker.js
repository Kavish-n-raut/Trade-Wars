import { PrismaClient } from '@prisma/client';
import { simulateStockPrice } from './stockApi.js';

const prisma = new PrismaClient();

// Update all stock prices
export const updateStockPrices = async () => {
  try {
    const stocks = await prisma.stock.findMany();

    if (stocks.length === 0) {
      console.log('⚠️ No stocks found in database');
      return;
    }

    for (const stock of stocks) {
      const { price, change, changePercent } = simulateStockPrice(stock.currentPrice);

      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          currentPrice: price,
          change: change,
          changePercent: changePercent,
        },
      });
    }

    console.log(`✅ Stocks updated: ${stocks.length}`);
  } catch (error) {
    console.error('❌ Update stock prices error:', error.message);
  }
};

// Update portfolio values for all users
export const updatePortfolioValues = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
      },
    });

    for (const user of users) {
      // Calculate current holdings value
      const holdingsValue = user.holdings.reduce(
        (sum, holding) => sum + (holding.quantity * holding.stock.currentPrice),
        0
      );

      // Calculate total invested in holdings
      const totalInvested = user.holdings.reduce(
        (sum, holding) => sum + (holding.quantity * holding.averagePrice),
        0
      );

      // Portfolio value = cash + holdings value
      const portfolioValue = user.balance + holdingsValue;

      // Profit/Loss = current holdings value - amount invested in holdings
      const profitLoss = holdingsValue - totalInvested;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          portfolioValue,
          profitLoss,
        },
      });
    }

    console.log(`✅ Portfolio values updated for ${users.length} users`);
  } catch (error) {
    console.error('❌ Update portfolio values error:', error.message);
  }
};

// Start automatic stock price updates
export const startStockTracker = () => {
  console.log('🔄 Stock tracker started');
  
  // Update immediately on startup
  updateStockPrices().then(() => {
    updatePortfolioValues();
  });
  
  // Update stock prices every 30 seconds
  setInterval(() => {
    updateStockPrices().then(() => {
      updatePortfolioValues();
    });
  }, 30000);
};

export default {
  updateStockPrices,
  updatePortfolioValues,
  startStockTracker,
};