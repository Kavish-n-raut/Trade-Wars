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
      take: limit ? parseInt(limit) : 100,
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

// Refresh news
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    await fetchGeneralMarketNews();
    console.log('✅ News refreshed');
    res.json({ message: 'News refreshed successfully' });
  } catch (error) {
    console.error('❌ Refresh news error:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

export default router;