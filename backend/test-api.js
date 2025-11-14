import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

console.log('🧪 Testing API Connections...\n');

// Test Alpha Vantage API
async function testAlphaVantage() {
  console.log('📊 Testing Alpha Vantage API...');
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=RELIANCE.BSE&apikey=${ALPHA_VANTAGE_KEY}`
    );
    
    if (response.data && response.data['Global Quote']) {
      console.log('✅ Alpha Vantage: Connected');
      const quote = response.data['Global Quote'];
      console.log(`   RELIANCE.BSE Price: ₹${quote['05. price']}`);
      console.log(`   Change: ${quote['10. change percent']}`);
      return true;
    } else {
      console.log('❌ Alpha Vantage: No data returned');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Alpha Vantage Error:', error.response?.data || error.message);
    return false;
  }
}

// Test Yahoo Finance API (No key needed)
async function testYahooFinance() {
  console.log('\n📊 Testing Yahoo Finance API...');
  try {
    const response = await axios.get(
      'https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS',
      {
        params: {
          interval: '1d',
          range: '1d',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    
    if (response.data && response.data.chart && response.data.chart.result) {
      const result = response.data.chart.result[0];
      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose || meta.previousClose;
      const change = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;
      
      console.log('✅ Yahoo Finance: Connected');
      console.log(`   RELIANCE.NS Price: ₹${price.toFixed(2)}`);
      console.log(`   Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
      console.log(`   Previous Close: ₹${previousClose.toFixed(2)}`);
      return true;
    } else {
      console.log('❌ Yahoo Finance: No data returned');
      return false;
    }
  } catch (error) {
    console.log('❌ Yahoo Finance Error:', error.message);
    return false;
  }
}

// Test NewsAPI
async function testNewsAPI() {
  console.log('\n📰 Testing NewsAPI...');
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=Reliance Industries&language=en&pageSize=3&apiKey=${NEWS_API_KEY}`
    );
    
    if (response.data && response.data.articles) {
      console.log('✅ NewsAPI: Connected');
      console.log(`   Found ${response.data.articles.length} articles`);
      if (response.data.articles.length > 0) {
        console.log(`   Latest: ${response.data.articles[0].title}`);
      }
      return true;
    } else {
      console.log('❌ NewsAPI: No data returned');
      return false;
    }
  } catch (error) {
    console.log('❌ NewsAPI Error:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const alphaOk = await testAlphaVantage();
  const yahooOk = await testYahooFinance();
  const newsOk = await testNewsAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Summary:');
  console.log('='.repeat(50));
  console.log(`Alpha Vantage: ${alphaOk ? '✅ PASS' : '❌ FAIL'} (Primary, 25/day)`);
  console.log(`Yahoo Finance: ${yahooOk ? '✅ PASS' : '❌ FAIL'} (Fallback, Unlimited)`);
  console.log(`NewsAPI:       ${newsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  if ((alphaOk || yahooOk) && newsOk) {
    console.log('\n🎉 All critical APIs are working!');
    console.log('💡 Strategy: Alpha Vantage (first 20 stocks) → Yahoo Finance (rest)');
  } else {
    console.log('\n⚠️  Some APIs failed. Check your keys and network.');
  }
}

runTests();