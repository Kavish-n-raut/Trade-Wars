import express from 'express';
import { updateStockPrices, updatePortfolioValues } from '../services/stockTracker.js';
import { fetchGeneralMarketNews } from '../services/newsService.js';

const router = express.Router();

// Cron endpoint to update stocks (called by Vercel Cron every minute)
router.get('/update-stocks', async (req, res) => {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = req.headers['x-vercel-cron-secret'];
    
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      console.log('⚠️ Unauthorized cron attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Cron job: Updating stocks and news...');
    
    // Update stock prices and portfolio values
    await updateStockPrices();
    await updatePortfolioValues();
    
    // Fetch news every 10th execution (every 10 minutes) to avoid API rate limits
    const now = new Date();
    if (now.getMinutes() % 10 === 0) {
      console.log('📰 Fetching latest news...');
      fetchGeneralMarketNews().catch(err => console.error('News fetch error:', err));
    }
    
    console.log('✅ Cron job: Stocks updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Stocks and portfolios updated',
      newsFetch: now.getMinutes() % 10 === 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    res.status(500).json({ 
      error: 'Update failed',
      message: error.message 
    });
  }
});

// Manual trigger endpoint (for testing)
router.post('/trigger-update', async (req, res) => {
  try {
    await updateStockPrices();
    await updatePortfolioValues();
    
    res.json({ 
      success: true, 
      message: 'Manual update triggered successfully' 
    });
  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    res.status(500).json({ 
      error: 'Update failed',
      message: error.message 
    });
  }
});

export default router;