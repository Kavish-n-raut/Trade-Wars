import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user holdings
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: req.user.userId },
      include: {
        stock: true,
      },
    });

    console.log(`✅ Holdings fetched for user ${req.user.userId}`);
    res.json(holdings);
  } catch (error) {
    console.error('❌ Get holdings error:', error);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { email },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;