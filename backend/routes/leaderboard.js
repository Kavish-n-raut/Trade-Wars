import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get leaderboard (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        portfolioValue: true,
        profitLoss: true,
      },
      orderBy: {
        portfolioValue: 'desc',
      },
      take: limit,
    });

    console.log(`✅ Leaderboard fetched: ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user rank (admin only)
router.get('/rank/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const allUsers = await prisma.user.findMany({
      select: { id: true, portfolioValue: true },
      orderBy: { portfolioValue: 'desc' },
    });

    const rank = allUsers.findIndex(user => user.id === userId) + 1;

    res.json({ rank });
  } catch (error) {
    console.error('❌ Get rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

export default router;