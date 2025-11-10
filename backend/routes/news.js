import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { fetchNewsForStock, fetchGeneralMarketNews } from '../services/newsService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all news (PUBLIC - no auth required)
router.get('/', async (req, res) => {
  try {
    const { search, symbol, startDate, endDate, limit } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (symbol) {
      where.symbol = symbol;
    }

    if (startDate || endDate) {
      where.publishedAt = {};
      if (startDate) where.publishedAt.gte = new Date(startDate);
      if (endDate) where.publishedAt.lte = new Date(endDate);
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });

    console.log(`📰 Fetched ${news.length} news articles`);
    res.json(news);
  } catch (error) {
    console.error('❌ Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get news for specific stock
router.get('/stock/:symbol', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { symbol: req.params.symbol },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    res.json(news);
  } catch (error) {
    console.error('❌ Get stock news error:', error);
    res.status(500).json({ error: 'Failed to fetch stock news' });
  }
});

// Create news (ADMIN ONLY)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, url, imageUrl, source, symbol } = req.body;

    if (!title || !url || !source) {
      return res.status(400).json({ error: 'Title, URL, and Source are required' });
    }

    const news = await prisma.news.create({
      data: {
        title,
        description: description || null,
        url,
        imageUrl: imageUrl || null,
        source,
        symbol: symbol || null,
        publishedAt: new Date(),
      },
    });

    console.log('✅ News created:', news.title);
    res.status(201).json(news);
  } catch (error) {
    console.error('❌ Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Delete news (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.news.delete({
      where: { id: parseInt(req.params.id) },
    });

    console.log('✅ News deleted:', req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('❌ Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Refresh news (authenticated users)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Manual news refresh triggered by user:', req.user.username);
    fetchGeneralMarketNews().catch(err => console.error('News refresh error:', err));
    res.json({ message: 'News refresh started in background' });
  } catch (error) {
    console.error('❌ Refresh news error:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

// Admin: Force immediate news fetch for all stocks
router.post('/fetch-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin triggered full news fetch');
    
    // Fetch in background
    (async () => {
      await fetchGeneralMarketNews();
      console.log('✅ Background news fetch completed');
    })().catch(err => console.error('Background fetch error:', err));
    
    res.json({ 
      message: 'Full news fetch started in background. This may take a few minutes.',
      info: 'News will be available shortly'
    });
  } catch (error) {
    console.error('❌ Fetch all news error:', error);
    res.status(500).json({ error: 'Failed to start news fetch' });
  }
});

export default router;