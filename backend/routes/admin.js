import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get admin statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalStocks, totalTransactions, totalNews] = await Promise.all([
      prisma.user.count(),
      prisma.stock.count(),
      prisma.transaction.count(),
      prisma.news.count(),
    ]);

    res.json({
      totalUsers,
      totalStocks,
      totalTransactions,
      totalNews,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { balance, portfolioValue, profitLoss, isAdmin } = req.body;
    
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(balance !== undefined && { balance }),
        ...(portfolioValue !== undefined && { portfolioValue }),
        ...(profitLoss !== undefined && { profitLoss }),
        ...(isAdmin !== undefined && { isAdmin }),
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Don't allow deleting yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Adjust prices by sector (admin only)
router.post('/adjust-sector-prices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sector, adjustmentType, adjustmentValue } = req.body;

    if (!sector || !adjustmentType || adjustmentValue === undefined) {
      return res.status(400).json({ 
        error: 'Sector, adjustment type, and value are required' 
      });
    }

    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) {
      return res.status(400).json({ error: 'Invalid adjustment value' });
    }

    // Get all stocks in the sector
    const stocks = await prisma.stock.findMany({
      where: { 
        sector: {
          equals: sector,
          mode: 'insensitive'
        }
      },
    });

    if (stocks.length === 0) {
      return res.status(404).json({ 
        error: `No stocks found in sector: ${sector}` 
      });
    }

    // Update each stock
    const updates = [];
    for (const stock of stocks) {
      let newPrice;
      
      if (adjustmentType === 'percentage') {
        // Adjust by percentage
        newPrice = stock.currentPrice * (1 + value / 100);
      } else {
        // Adjust by absolute value
        newPrice = stock.currentPrice + value;
      }

      // Ensure price doesn't go below 1
      newPrice = Math.max(1, newPrice);

      const change = newPrice - stock.currentPrice;
      const changePercent = stock.currentPrice > 0 ? (change / stock.currentPrice) * 100 : 0;

      updates.push(
        prisma.stock.update({
          where: { id: stock.id },
          data: {
            currentPrice: newPrice,
            change: change,
            changePercent: changePercent,
            lastUpdated: new Date(),
          },
        })
      );
    }

    await Promise.all(updates);

    console.log(`✅ Adjusted ${stocks.length} stocks in sector: ${sector} by ${adjustmentType === 'percentage' ? value + '%' : '₹' + value}`);

    res.json({ 
      message: `Successfully adjusted ${stocks.length} stocks in ${sector}`,
      stocksUpdated: stocks.length,
      sector,
      adjustmentType,
      adjustmentValue: value
    });
  } catch (error) {
    console.error('❌ Adjust sector prices error:', error);
    res.status(500).json({ error: 'Failed to adjust prices: ' + error.message });
  }
});

// Get unique sectors (admin only)
router.get('/sectors', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      where: {
        sector: {
          not: null
        }
      },
      select: {
        sector: true
      },
      distinct: ['sector'],
    });

    const sectors = stocks.map(s => s.sector).filter(Boolean).sort();

    res.json(sectors);
  } catch (error) {
    console.error('❌ Get sectors error:', error);
    res.status(500).json({ error: 'Failed to fetch sectors' });
  }
});

export default router;