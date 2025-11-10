import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Buy stock
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { stockId, quantity, price } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!stockId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Verify stock exists
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const totalAmount = price * quantity;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < totalAmount) {
      return res.status(400).json({ 
        error: `Insufficient balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${user.balance.toFixed(2)}` 
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        stockId,
        type: 'BUY',
        quantity,
        price,
        totalAmount,
      },
      include: {
        stock: true,
      },
    });

    // Update or create holding
    const existingHolding = await prisma.holding.findFirst({
      where: { userId, stockId },
    });

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newAveragePrice =
        (existingHolding.averagePrice * existingHolding.quantity + totalAmount) /
        newQuantity;

      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
        },
      });
    } else {
      await prisma.holding.create({
        data: {
          userId,
          stockId,
          quantity,
          averagePrice: price,
        },
      });
    }

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance - totalAmount },
    });

    // Update portfolio value
    await updatePortfolioValue(userId);

    // Apply dynamic pricing based on demand
    await applyDynamicPricing(stockId, 'BUY', quantity);

    console.log(`✅ Buy: User ${userId} bought ${quantity} shares of ${stock.symbol} at ₹${price}`);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('❌ Buy transaction error:', error);
    res.status(500).json({ error: 'Failed to complete purchase: ' + error.message });
  }
});

// Sell stock
router.post('/sell', authenticateToken, async (req, res) => {
  try {
    const { stockId, quantity, price } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!stockId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Verify stock exists
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Check holding
    const holding = await prisma.holding.findFirst({
      where: { userId, stockId: parseInt(stockId) },
    });

    if (!holding) {
      return res.status(400).json({ error: 'You do not own any shares of this stock' });
    }

    if (holding.quantity < quantity) {
      return res.status(400).json({ 
        error: `Insufficient shares. You own ${holding.quantity} shares, trying to sell ${quantity}` 
      });
    }

    const totalAmount = price * quantity;
    
    // Calculate realized profit/loss for this sale
    const costBasis = holding.averagePrice * quantity;
    const realizedPL = totalAmount - costBasis;

    // Create transaction with profit/loss
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        stockId,
        type: 'SELL',
        quantity,
        price,
        totalAmount,
        profitLoss: realizedPL,
      },
      include: {
        stock: true,
      },
    });

    // Update holding
    if (holding.quantity === quantity) {
      await prisma.holding.delete({
        where: { id: holding.id },
      });
    } else {
      await prisma.holding.update({
        where: { id: holding.id },
        data: {
          quantity: holding.quantity - quantity,
        },
      });
    }

    // Update user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Update user balance and add realized profit/loss
    await prisma.user.update({
      where: { id: userId },
      data: { 
        balance: user.balance + totalAmount,
        realizedProfitLoss: user.realizedProfitLoss + realizedPL,
      },
    });

    // Update portfolio value
    await updatePortfolioValue(userId);

    // Apply dynamic pricing based on demand
    await applyDynamicPricing(stockId, 'SELL', quantity);

    console.log(
      `✅ Sell: User ${userId} sold ${quantity} shares of ${stock.symbol} at ₹${price} ` +
      `(Cost: ₹${costBasis.toFixed(2)}, P/L: ${realizedPL >= 0 ? '+' : ''}₹${realizedPL.toFixed(2)})`
    );
    
    res.status(201).json({
      ...transaction,
      realizedProfitLoss: realizedPL,
    });
  } catch (error) {
    console.error('❌ Sell transaction error:', error);
    res.status(500).json({ error: 'Failed to complete sale: ' + error.message });
  }
});

// Get transaction history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get transactions for a specific stock
router.get('/stock/:stockId', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        stockId: parseInt(req.params.stockId),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get stock transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Helper function to update portfolio value
async function updatePortfolioValue(userId) {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { stock: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Calculate current holdings value
    const holdingsValue = holdings.reduce(
      (sum, h) => sum + h.stock.currentPrice * h.quantity,
      0
    );

    // Calculate total invested in current holdings
    const totalInvested = holdings.reduce(
      (sum, h) => sum + h.averagePrice * h.quantity,
      0
    );

    // Calculate unrealized profit/loss (from current holdings)
    const unrealizedPL = holdingsValue - totalInvested;
    
    // Total profit/loss = realized (from past sales) + unrealized (current holdings)
    const totalProfitLoss = user.realizedProfitLoss + unrealizedPL;

    // Portfolio value = cash balance + current holdings value
    const portfolioValue = user.balance + holdingsValue;

    await prisma.user.update({
      where: { id: userId },
      data: {
        portfolioValue,
        profitLoss: totalProfitLoss,
      },
    });

    console.log(
      `📊 Portfolio updated for user ${userId}: ` +
      `Value: ₹${portfolioValue.toFixed(2)}, ` +
      `Total P/L: ₹${totalProfitLoss.toFixed(2)} ` +
      `(Realized: ₹${user.realizedProfitLoss.toFixed(2)}, Unrealized: ₹${unrealizedPL.toFixed(2)})`
    );
  } catch (error) {
    console.error('Update portfolio value error:', error);
  }
}

// Helper function to apply dynamic pricing based on buy/sell pressure
async function applyDynamicPricing(stockId, transactionType, quantity) {
  try {
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(stockId) },
    });

    if (!stock) return;

    // Get recent transactions (last hour) for this stock
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentBuys = await prisma.transaction.aggregate({
      where: {
        stockId: parseInt(stockId),
        type: 'BUY',
        createdAt: { gte: oneHourAgo },
      },
      _sum: { quantity: true },
    });

    const recentSells = await prisma.transaction.aggregate({
      where: {
        stockId: parseInt(stockId),
        type: 'SELL',
        createdAt: { gte: oneHourAgo },
      },
      _sum: { quantity: true },
    });

    const buyVolume = recentBuys._sum.quantity || 0;
    const sellVolume = recentSells._sum.quantity || 0;
    const netVolume = buyVolume - sellVolume;

    // Calculate price change based on demand
    // Price increases with buying pressure, decreases with selling pressure
    // Base rate: 0.1% price change per 100 units of net volume
    const priceChangePercent = (netVolume / 100) * 0.001; // 0.1% per 100 units
    const maxChangePercent = 0.05; // Max 5% change in an hour
    
    const cappedChangePercent = Math.max(
      -maxChangePercent,
      Math.min(maxChangePercent, priceChangePercent)
    );

    const newPrice = stock.currentPrice * (1 + cappedChangePercent);
    const change = newPrice - stock.openPrice;
    const changePercent = stock.openPrice > 0 ? (change / stock.openPrice) * 100 : 0;

    // Update stock price
    await prisma.stock.update({
      where: { id: parseInt(stockId) },
      data: {
        currentPrice: newPrice,
        change: change,
        changePercent: changePercent,
        high: Math.max(stock.high, newPrice),
        low: Math.min(stock.low, newPrice),
        volume: stock.volume + quantity,
        lastUpdated: new Date(),
      },
    });

    console.log(
      `📊 Dynamic pricing: ${stock.symbol} - Buy: ${buyVolume}, Sell: ${sellVolume}, ` +
      `Price: ₹${stock.currentPrice.toFixed(2)} → ₹${newPrice.toFixed(2)} (${cappedChangePercent >= 0 ? '+' : ''}${(cappedChangePercent * 100).toFixed(3)}%)`
    );
  } catch (error) {
    console.error('Apply dynamic pricing error:', error);
  }
}

export default router;