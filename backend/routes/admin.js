import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import nifty50Data from '../prisma/nifty50.js';

const router = express.Router();

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

// Get all transactions (admin only)
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        stock: {
          select: {
            id: true,
            symbol: true,
            companyName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Last 100 transactions
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get user portfolio details (admin only)
router.get('/users/:id/portfolio', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        holdings: {
          include: {
            stock: true,
          }
        },
        transactions: {
          include: {
            stock: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 transactions
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch user portfolio' });
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

// Delete stock forcefully (admin only) - removes stock even if users hold it
router.delete('/stocks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stockId = parseInt(req.params.id);
    
    // Get stock details before deletion
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      select: {
        symbol: true,
        name: true,
      }
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Delete all transactions related to this stock
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: { stockId: stockId },
    });

    // Delete all holdings related to this stock
    const deletedHoldings = await prisma.holding.deleteMany({
      where: { stockId: stockId },
    });

    // Delete the stock itself
    await prisma.stock.delete({
      where: { id: stockId },
    });

    console.log(
      `✅ Admin forcefully deleted stock ${stock.symbol} (${stock.name}): ` +
      `${deletedHoldings.count} holdings removed, ${deletedTransactions.count} transactions removed`
    );

    res.json({ 
      message: `Stock ${stock.symbol} deleted successfully`,
      stock: stock,
      deletedHoldings: deletedHoldings.count,
      deletedTransactions: deletedTransactions.count,
    });
  } catch (error) {
    console.error('❌ Delete stock error:', error);
    res.status(500).json({ error: 'Failed to delete stock: ' + error.message });
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

// Adjust user balance (admin only) - Add or deduct money
router.post('/users/:id/adjust-balance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, reason } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const adjustmentAmount = parseFloat(amount);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate new balance
    const newBalance = user.balance + adjustmentAmount;

    if (newBalance < 0) {
      return res.status(400).json({ 
        error: 'Cannot deduct more than available balance',
        currentBalance: user.balance,
        attemptedDeduction: Math.abs(adjustmentAmount)
      });
    }

    // Calculate holdings value
    const holdingsValue = user.holdings.reduce(
      (sum, holding) => sum + (holding.quantity * holding.stock.currentPrice),
      0
    );

    // Calculate new portfolio value
    const newPortfolioValue = newBalance + holdingsValue;

    // Update user balance and portfolio value
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: newBalance,
        portfolioValue: newPortfolioValue,
      },
      select: {
        id: true,
        username: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
      },
    });

    console.log(
      `✅ Admin adjusted balance for user ${user.username}: ` +
      `${adjustmentAmount >= 0 ? '+' : ''}₹${adjustmentAmount.toFixed(2)} ` +
      `(New balance: ₹${newBalance.toFixed(2)})` +
      (reason ? ` - Reason: ${reason}` : '')
    );

    res.json({
      success: true,
      message: `Successfully ${adjustmentAmount >= 0 ? 'added' : 'deducted'} ₹${Math.abs(adjustmentAmount).toFixed(2)} ${adjustmentAmount >= 0 ? 'to' : 'from'} ${user.username}'s account`,
      user: updatedUser,
      adjustment: {
        amount: adjustmentAmount,
        previousBalance: user.balance,
        newBalance: newBalance,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('❌ Adjust balance error:', error);
    res.status(500).json({ error: 'Failed to adjust balance: ' + error.message });
  }
});

// Set user profit/loss value (admin only)
router.post('/users/:id/set-profit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { profitLoss, reason } = req.body;

    if (profitLoss === undefined || isNaN(parseFloat(profitLoss))) {
      return res.status(400).json({ error: 'Valid profit/loss value is required' });
    }

    const newProfitLoss = parseFloat(profitLoss);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profitLoss: true,
        realizedProfitLoss: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const previousProfitLoss = user.profitLoss;

    // Update user profit/loss
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profitLoss: newProfitLoss,
      },
      select: {
        id: true,
        username: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
      },
    });

    console.log(
      `✅ Admin set profit/loss for user ${user.username}: ` +
      `₹${newProfitLoss.toFixed(2)} (Previous: ₹${previousProfitLoss.toFixed(2)})` +
      (reason ? ` - Reason: ${reason}` : '')
    );

    res.json({
      success: true,
      message: `Successfully set profit/loss to ₹${newProfitLoss.toFixed(2)} for ${user.username}'s account`,
      user: updatedUser,
      adjustment: {
        previousProfitLoss: previousProfitLoss,
        newProfitLoss: newProfitLoss,
        change: newProfitLoss - previousProfitLoss,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('❌ Set profit/loss error:', error);
    res.status(500).json({ error: 'Failed to set profit/loss: ' + error.message });
  }
});

// Set user portfolio value (admin only)
router.post('/users/:id/set-portfolio', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { portfolioValue, reason } = req.body;

    if (portfolioValue === undefined || isNaN(parseFloat(portfolioValue))) {
      return res.status(400).json({ error: 'Valid portfolio value is required' });
    }

    const newPortfolioValue = parseFloat(portfolioValue);

    if (newPortfolioValue < 0) {
      return res.status(400).json({ error: 'Portfolio value cannot be negative' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        portfolioValue: true,
        balance: true,
        profitLoss: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const previousPortfolioValue = user.portfolioValue;

    // Update user portfolio value
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        portfolioValue: newPortfolioValue,
      },
      select: {
        id: true,
        username: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        realizedProfitLoss: true,
      },
    });

    console.log(
      `✅ Admin set portfolio value for user ${user.username}: ` +
      `₹${newPortfolioValue.toFixed(2)} (Previous: ₹${previousPortfolioValue.toFixed(2)})` +
      (reason ? ` - Reason: ${reason}` : '')
    );

    res.json({
      success: true,
      message: `Successfully set portfolio value to ₹${newPortfolioValue.toFixed(2)} for ${user.username}'s account`,
      user: updatedUser,
      adjustment: {
        previousPortfolioValue: previousPortfolioValue,
        newPortfolioValue: newPortfolioValue,
        change: newPortfolioValue - previousPortfolioValue,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('❌ Set portfolio value error:', error);
    res.status(500).json({ error: 'Failed to set portfolio value: ' + error.message });
  }
});

// Seed database with 100 stocks (admin only)
router.post('/seed-stocks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🌱 Admin initiated database seed...');

    // Clear existing stocks, holdings, and transactions (but NOT users)
    await prisma.transaction.deleteMany({});
    await prisma.holding.deleteMany({});
    await prisma.stock.deleteMany({});

    console.log('✅ Cleared existing stocks, holdings, and transactions (users preserved)');

    // Reset all user balances, portfolio values, and profit/loss to ₹5,00,000
    const users = await prisma.user.findMany();
    const resetAmount = 500000;
    
    await Promise.all(
      users.map(user => 
        prisma.user.update({
          where: { id: user.id },
          data: {
            balance: resetAmount,
            portfolioValue: resetAmount,
            profitLoss: 0,
            realizedProfitLoss: 0,
          }
        })
      )
    );
    
    console.log(`✅ Reset ${users.length} user accounts to ₹${resetAmount.toLocaleString('en-IN')}`);

    // Create all 100 stocks
    console.log(`📊 Creating ${nifty50Data.length} stocks...`);
    const stockPromises = nifty50Data.map((stock) =>
      prisma.stock.create({
        data: {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          currentPrice: stock.price,
          openPrice: stock.price * 0.99,
          high: stock.price * 1.02,
          low: stock.price * 0.98,
          change: stock.price * 0.01,
          changePercent: 1.0,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          isTracking: true,
          lastUpdated: new Date(),
        },
      })
    );

    await Promise.all(stockPromises);
    console.log(`✅ Created ${nifty50Data.length} stocks`);

    // Count stocks by sector
    const stocks = await prisma.stock.findMany();
    const sectorCounts = stocks.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Stock Distribution:', sectorCounts);

    res.json({
      success: true,
      message: `Successfully seeded ${stocks.length} stocks across ${Object.keys(sectorCounts).length} sectors and reset ${users.length} user accounts`,
      totalStocks: stocks.length,
      sectors: Object.keys(sectorCounts).length,
      usersReset: users.length,
      resetAmount: resetAmount,
      distribution: sectorCounts,
    });
  } catch (error) {
    console.error('❌ Seed stocks error:', error);
    res.status(500).json({ error: 'Failed to seed stocks: ' + error.message });
  }
});

export default router;