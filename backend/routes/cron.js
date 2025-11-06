import express from 'express';
import { updateStockPrices, updatePortfolioValues } from '../services/stockTracker.js';

const router = express.Router();

// Cron endpoint to update stocks (called by Vercel Cron every 5 minutes)
router.get('/update-stocks', async (req, res) => {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = req.headers['x-vercel-cron-secret'];
    
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      console.log('⚠️ Unauthorized cron attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Cron job: Updating stocks...');
    
    await updateStockPrices();
    await updatePortfolioValues();
    
    console.log('✅ Cron job: Stocks updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Stocks and portfolios updated',
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