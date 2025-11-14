import { prisma } from '../lib/prisma.js';
import { simulateStockPrice } from './stockApi.js';

// Simulate price fluctuation (1% per minute - ONLY NEGATIVE)
const simulateMinuteFluctuation = (currentPrice) => {
  // Random fluctuation between -1% to 0% (only negative)
  const changePercent = -Math.random() * 1; // -1% to 0%
  const newPrice = currentPrice * (1 + changePercent / 100);
  const change = newPrice - currentPrice;
  
  return {
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(4)),
  };
};

// Update all stock prices
export const updateStockPrices = async () => {
  try {
    const stocks = await prisma.stock.findMany();

    if (stocks.length === 0) {
      console.log('⚠️ No stocks found in database');
      return 0;
    }

    let updatedCount = 0;
    const updateTime = new Date();

    for (const stock of stocks) {
      // Simulate 0.1% fluctuation per minute
      const { price, change, changePercent } = simulateMinuteFluctuation(stock.currentPrice);

      // Calculate change from opening price
      const changeFromOpen = price - stock.openPrice;
      const changePercentFromOpen = stock.openPrice > 0 
        ? ((changeFromOpen / stock.openPrice) * 100) 
        : 0;

      // Check circuit breaker conditions (±25% from open price)
      const upperCircuitLimit = stock.openPrice * 1.25; // +25%
      const lowerCircuitLimit = stock.openPrice * 0.75; // -25%
      
      let circuitTripped = false;
      let circuitType = '';
      let finalPrice = price;

      if (price >= upperCircuitLimit) {
        circuitTripped = true;
        circuitType = 'UPPER';
        finalPrice = upperCircuitLimit;
        console.log(`🔴 UPPER CIRCUIT: ${stock.symbol} hit +25% limit at ₹${upperCircuitLimit.toFixed(2)}`);
      } else if (price <= lowerCircuitLimit) {
        circuitTripped = true;
        circuitType = 'LOWER';
        finalPrice = lowerCircuitLimit;
        console.log(`🔴 LOWER CIRCUIT: ${stock.symbol} hit -25% limit at ₹${lowerCircuitLimit.toFixed(2)}`);
      }

      // Recalculate change with final price
      const finalChangeFromOpen = finalPrice - stock.openPrice;
      const finalChangePercentFromOpen = stock.openPrice > 0 
        ? ((finalChangeFromOpen / stock.openPrice) * 100) 
        : 0;

      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          currentPrice: finalPrice,
          change: finalChangeFromOpen,
          changePercent: finalChangePercentFromOpen,
          high: Math.max(stock.high, finalPrice),
          low: Math.min(stock.low, finalPrice),
          circuitTripped: circuitTripped,
          circuitType: circuitType,
          lastUpdated: updateTime,
        },
      });

      updatedCount++;
    }

    console.log(`✅ Stocks updated: ${updatedCount} (${updateTime.toLocaleTimeString()})`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Update stock prices error:', error.message);
    throw error;
  }
};

// Update portfolio values for all users
export const updatePortfolioValues = async () => {
  try {
    const updateTime = new Date();
    const users = await prisma.user.findMany({
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log('⚠️ No users found in database');
      return 0;
    }

    let updatedCount = 0;

    for (const user of users) {
      // Calculate current holdings value
      const holdingsValue = user.holdings.reduce(
        (sum, holding) => sum + (holding.quantity * holding.stock.currentPrice),
        0
      );

      // Calculate total invested in current holdings
      const totalInvested = user.holdings.reduce(
        (sum, holding) => sum + (holding.quantity * holding.averagePrice),
        0
      );

      // Calculate unrealized profit/loss (from current holdings)
      const unrealizedPL = holdingsValue - totalInvested;
      
      // Total profit/loss = realized (from past sales) + unrealized (current holdings)
      const totalProfitLoss = user.realizedProfitLoss + unrealizedPL;

      // Portfolio value = cash balance + current holdings value
      const portfolioValue = user.balance + holdingsValue;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          portfolioValue,
          profitLoss: totalProfitLoss,
        },
      });

      updatedCount++;
    }

    console.log(`✅ Portfolios updated: ${updatedCount} users (${updateTime.toLocaleTimeString()})`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Update portfolio values error:', error.message);
    throw error;
  }
};

// Start automatic stock price updates
export const startStockTracker = () => {
  console.log('� Stock tracker initialized - Updates every 30 seconds');
  console.log('📊 Each update applies 0.1% random fluctuation to stock prices');
  
  // Update immediately on startup
  updateStockPrices()
    .then(() => updatePortfolioValues())
    .catch(err => console.error('❌ Initial update failed:', err.message));
  
  // Update stock prices every 30 seconds (in production, use Vercel Cron for 1 minute)
  const intervalId = setInterval(() => {
    updateStockPrices()
      .then(() => updatePortfolioValues())
      .catch(err => console.error('❌ Periodic update failed:', err.message));
  }, 30000);
  
  // Return interval ID for cleanup if needed
  return intervalId;
};

export default {
  updateStockPrices,
  updatePortfolioValues,
  startStockTracker,
};