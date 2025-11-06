const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticateToken = require('../middleware/auth');

// Get user transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Buy stock
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const userId = req.user.userId;

    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock || !stock.isActive) {
      return res.status(400).json({ error: 'Stock not available' });
    }

    const total = stock.currentPrice * quantity;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.balance < total) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance - total }
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        stockId,
        type: 'BUY',
        quantity,
        price: stock.currentPrice,
        total
      }
    });

    // Update or create holding
    const existingHolding = await prisma.holding.findUnique({
      where: {
        userId_stockId: { userId, stockId }
      }
    });

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + total) / newQuantity;
      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        }
      });
    } else {
      await prisma.holding.create({
        data: {
          userId,
          stockId,
          quantity,
          avgPrice: stock.currentPrice
        }
      });
    }

    res.json({ message: 'Stock purchased successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transaction failed' });
  }
});

// Sell stock
router.post('/sell', authenticateToken, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const userId = req.user.userId;

    const holding = await prisma.holding.findUnique({
      where: {
        userId_stockId: { userId, stockId }
      },
      include: { stock: true }
    });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient holdings' });
    }

    const total = holding.stock.currentPrice * quantity;

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: total } }
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        stockId,
        type: 'SELL',
        quantity,
        price: holding.stock.currentPrice,
        total
      }
    });

    // Update holding
    if (holding.quantity === quantity) {
      await prisma.holding.delete({ where: { id: holding.id } });
    } else {
      await prisma.holding.update({
        where: { id: holding.id },
        data: { quantity: holding.quantity - quantity }
      });
    }

    res.json({ message: 'Stock sold successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transaction failed' });
  }
});

module.exports = router;