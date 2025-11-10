import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { fetchNewsForStock } from '../services/newsService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const { search, sector } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (sector) {
      where.sector = sector;
    }

    const stocks = await prisma.stock.findMany({
      where,
      orderBy: { symbol: 'asc' },
    });

    console.log(`✅ Stocks fetched: ${stocks.length}`);
    res.json(stocks);
  } catch (error) {
    console.error('❌ Get stocks error:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Get stock by ID
router.get('/:id', async (req, res) => {
  try {
    const stock = await prisma.stock.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    console.error('❌ Get stock error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Get stock by symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const stock = await prisma.stock.findUnique({
      where: { symbol: req.params.symbol.toUpperCase() },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    console.error('❌ Get stock by symbol error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Create stock (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { symbol, name, sector, currentPrice } = req.body;

    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({ error: 'Symbol, name, and price are required' });
    }

    const price = parseFloat(currentPrice);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    // Check if stock already exists
    const existing = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase().trim() },
    });

    if (existing) {
      return res.status(400).json({ error: 'Stock with this symbol already exists' });
    }

    const stock = await prisma.stock.create({
      data: {
        symbol: symbol.toUpperCase().trim(),
        name: name.trim(),
        sector: sector ? sector.trim() : null,
        currentPrice: price,
        openPrice: price,
        high: price,
        low: price,
        change: 0,
        changePercent: 0,
        volume: 0,
        isTracking: true,
        lastUpdated: new Date(),
      },
    });

    console.log('✅ Stock created:', stock.symbol);

    // Fetch news for new stock in background
    fetchNewsForStock(stock.symbol).catch(err => 
      console.error('Failed to fetch news:', err)
    );

    res.status(201).json(stock);
  } catch (error) {
    console.error('❌ Create stock error:', error);
    res.status(500).json({ error: 'Failed to create stock: ' + error.message });
  }
});

// Update stock (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { symbol, name, sector, currentPrice } = req.body;
    const stockId = parseInt(req.params.id);

    if (isNaN(stockId)) {
      return res.status(400).json({ error: 'Invalid stock ID' });
    }

    // Check if stock exists
    const oldStock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!oldStock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const updateData = {};
    if (symbol) updateData.symbol = symbol.toUpperCase().trim();
    if (name) updateData.name = name.trim();
    if (sector !== undefined) updateData.sector = sector ? sector.trim() : null;
    
    if (currentPrice !== undefined && currentPrice !== null) {
      const newPrice = parseFloat(currentPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        return res.status(400).json({ error: 'Invalid price value' });
      }
      const change = newPrice - oldStock.currentPrice;
      const changePercent = oldStock.currentPrice > 0 ? (change / oldStock.currentPrice) * 100 : 0;
      
      updateData.currentPrice = newPrice;
      updateData.change = change;
      updateData.changePercent = changePercent;
      updateData.lastUpdated = new Date();
    }

    const stock = await prisma.stock.update({
      where: { id: stockId },
      data: updateData,
    });

    console.log('✅ Stock updated:', stock.symbol);
    res.json(stock);
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock: ' + error.message });
  }
});

// Delete stock (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stockId = parseInt(req.params.id);

    if (isNaN(stockId)) {
      return res.status(400).json({ error: 'Invalid stock ID' });
    }

    // Check if stock exists
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Check if stock has holdings
    const holdings = await prisma.holding.findFirst({
      where: { stockId },
    });

    if (holdings) {
      return res.status(400).json({ 
        error: 'Cannot delete stock with existing holdings. Users still own shares of this stock.' 
      });
    }

    // Check if stock has transactions
    const transactions = await prisma.transaction.findFirst({
      where: { stockId },
    });

    if (transactions) {
      return res.status(400).json({ 
        error: 'Cannot delete stock with transaction history. Consider marking it as inactive instead.' 
      });
    }

    // Delete related news first
    await prisma.news.deleteMany({
      where: { symbol: stock.symbol },
    });

    // Delete the stock
    await prisma.stock.delete({
      where: { id: stockId },
    });

    console.log('✅ Stock deleted:', stock.symbol);
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('❌ Delete stock error:', error);
    res.status(500).json({ error: 'Failed to delete stock: ' + error.message });
  }
});

// Get trending stocks (most bought and most sold)
router.get('/trending', async (req, res) => {
  try {
    const timeWindow = new Date();
    timeWindow.setHours(timeWindow.getHours() - 24); // Last 24 hours

    // Get most bought stocks
    const mostBought = await prisma.transaction.groupBy({
      by: ['stockId'],
      where: {
        type: 'BUY',
        createdAt: {
          gte: timeWindow,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get most sold stocks
    const mostSold = await prisma.transaction.groupBy({
      by: ['stockId'],
      where: {
        type: 'SELL',
        createdAt: {
          gte: timeWindow,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Fetch stock details for most bought
    const boughtStockIds = mostBought.map(t => t.stockId);
    const boughtStocks = await prisma.stock.findMany({
      where: { id: { in: boughtStockIds } },
    });

    const boughtWithQuantity = mostBought.map(mb => {
      const stock = boughtStocks.find(s => s.id === mb.stockId);
      return {
        ...stock,
        totalQuantity: mb._sum.quantity,
      };
    });

    // Fetch stock details for most sold
    const soldStockIds = mostSold.map(t => t.stockId);
    const soldStocks = await prisma.stock.findMany({
      where: { id: { in: soldStockIds } },
    });

    const soldWithQuantity = mostSold.map(ms => {
      const stock = soldStocks.find(s => s.id === ms.stockId);
      return {
        ...stock,
        totalQuantity: ms._sum.quantity,
      };
    });

    console.log(`✅ Trending stocks fetched: ${boughtWithQuantity.length} bought, ${soldWithQuantity.length} sold`);
    res.json({
      mostBought: boughtWithQuantity,
      mostSold: soldWithQuantity,
    });
  } catch (error) {
    console.error('❌ Get trending stocks error:', error);
    res.status(500).json({ error: 'Failed to fetch trending stocks: ' + error.message });
  }
});

export default router;