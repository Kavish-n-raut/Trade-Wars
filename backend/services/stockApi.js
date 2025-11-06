import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const API_URL = 'https://www.alphavantage.co/query';

// Simulate stock price changes (used when API not configured)
export const simulateStockPrice = (basePrice) => {
  const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
  const change = (basePrice * changePercent) / 100;
  return {
    price: parseFloat((basePrice + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
  };
};

// Get stock price from Alpha Vantage API (if configured)
export const getStockPrice = async (symbol) => {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.log('⚠️ ALPHA_VANTAGE_API_KEY not configured, using simulation');
    return null;
  }

  try {
    const response = await axios.get(API_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const quote = response.data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      console.log(`⚠️ No data for ${symbol}, using simulation`);
      return null;
    }

    return {
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    };
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error.message);
    return null;
  }
};

// Get multiple stock quotes in batch
export const getBatchStockPrices = async (symbols) => {
  const results = {};
  
  for (const symbol of symbols) {
    const price = await getStockPrice(symbol);
    results[symbol] = price;
    
    // Rate limiting - Alpha Vantage free tier: 5 calls per minute
    await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds
  }
  
  return results;
};

export default {
  getStockPrice,
  getBatchStockPrices,
  simulateStockPrice,
};