import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch news only for stocks in our database - Financial sector focused
export const fetchGeneralMarketNews = async () => {
  try {
    // Get all stock symbols from database
    const stocks = await prisma.stock.findMany({
      select: { symbol: true, name: true }
    });

    if (stocks.length === 0) {
      console.log('⚠️ No stocks found in database');
      return;
    }

    console.log(`📊 Fetching financial news for ${stocks.length} stocks...`);

    // Fetch general Indian market news first (this provides broad coverage)
    await fetchGeneralIndianMarketNews();

    // Rotate through all 50 stocks - fetch 5 stocks per batch to spread across time
    // This ensures all stocks get news coverage over time without hitting API limits
    const stocksPerBatch = 5;
    const currentMinute = new Date().getMinutes();
    const startIndex = (currentMinute % 10) * stocksPerBatch; // Rotate through stocks
    
    const batchStocks = [];
    for (let i = 0; i < stocksPerBatch; i++) {
      const index = (startIndex + i) % stocks.length;
      batchStocks.push(stocks[index]);
    }

    console.log(`📰 Fetching news for stocks: ${batchStocks.map(s => s.symbol).join(', ')}`);
    
    for (const stock of batchStocks) {
      await fetchNewsForStock(stock.symbol);
      await new Promise(resolve => setTimeout(resolve, 800)); // Rate limiting
    }

    console.log('✅ News update complete');
  } catch (error) {
    console.error('❌ Fetch market news error:', error.message);
  }
};

// Fetch news for specific stock - Financial sector focused
export const fetchNewsForStock = async (symbol) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      console.log('⚠️ NEWS_API_KEY not configured');
      return;
    }

    // Get stock details
    const stock = await prisma.stock.findFirst({
      where: { symbol }
    });

    if (!stock) {
      console.log(`⚠️ Stock ${symbol} not found in database`);
      return;
    }

    // Search with financial keywords to filter results
    const searchQuery = `(${stock.name} OR ${symbol}) AND (stock OR finance OR market OR trading OR shares OR earnings OR BSE OR NSE OR Nifty)`;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: searchQuery,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        domains: 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,reuters.com,bloomberg.com', // Financial news sources
        apiKey: API_KEY,
      },
    });

    const articles = response.data.articles;

    // Filter articles to ensure they're finance-related
    const financialKeywords = ['stock', 'share', 'market', 'finance', 'trading', 'investment', 'earnings', 'profit', 'revenue', 'bse', 'nse', 'nifty', 'sensex', 'equity'];
    const filteredArticles = articles.filter(article => {
      const text = (article.title + ' ' + article.description).toLowerCase();
      return financialKeywords.some(keyword => text.includes(keyword));
    });

    // Save to database
    for (const article of filteredArticles) {
      try {
        await prisma.news.upsert({
          where: {
            url: article.url,
          },
          update: {},
          create: {
            title: article.title,
            description: article.description || null,
            url: article.url,
            imageUrl: article.urlToImage || null,
            publishedAt: new Date(article.publishedAt),
            source: article.source.name,
            symbol: symbol, // Tag with stock symbol
          },
        });
      } catch (err) {
        // Skip duplicate or invalid articles
        console.log(`⚠️ Skipping article: ${article.title}`);
      }
    }

    console.log(`✅ Fetched ${filteredArticles.length} financial articles for ${symbol}`);
  } catch (error) {
    console.error(`❌ Fetch news for ${symbol} error:`, error.message);
  }
};

// Fetch general Indian market/Nifty news
export const fetchGeneralIndianMarketNews = async () => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      return;
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: '(Nifty 50 OR Sensex OR NSE OR BSE OR Indian stock market) AND (market OR trading OR stocks)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        domains: 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,reuters.com,bloomberg.com',
        apiKey: API_KEY,
      },
    });

    const articles = response.data.articles;

    // Save general market news without stock symbol
    for (const article of articles) {
      try {
        await prisma.news.upsert({
          where: {
            url: article.url,
          },
          update: {},
          create: {
            title: article.title,
            description: article.description || null,
            url: article.url,
            imageUrl: article.urlToImage || null,
            publishedAt: new Date(article.publishedAt),
            source: article.source.name,
            symbol: null, // General market news
          },
        });
      } catch (err) {
        console.log(`⚠️ Skipping article: ${article.title}`);
      }
    }

    console.log(`✅ Fetched ${articles.length} general market articles`);
  } catch (error) {
    console.error(`❌ Fetch general market news error:`, error.message);
  }
};