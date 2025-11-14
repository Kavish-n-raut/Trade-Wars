import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nifty50Data from './nifty50.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('⚠️ WARNING: This will DELETE ALL USERS, transactions, holdings, and stocks!');

  // Clear ALL existing data including USERS
  await prisma.transaction.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.news.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.user.deleteMany(); // ⚠️ DELETE ALL USERS

  console.log('✅ Cleared ALL data including users');

  // Create new admin with custom credentials
  // ⚠️ CHANGE THESE VALUES before running seed!
  const ADMIN_USERNAME = 'kansabel';
  const ADMIN_PASSWORD = 'kanabel'; // ⚠️ CHANGE THIS!
  const ADMIN_EMAIL = 'admin@ecellrvitm.in';

  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: adminPassword,
      isAdmin: true,
      balance: 500000,
      portfolioValue: 500000,
      profitLoss: 0,
    },
  });
  console.log('✅ Created admin user');
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log('⚠️ SAVE THESE CREDENTIALS - passwords are encrypted in database!');

  // Create stocks from Nifty 50
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

  console.log('\n📈 Stock Distribution:');
  Object.entries(sectorCounts).sort(([,a], [,b]) => b - a).forEach(([sector, count]) => {
    console.log(`  ${sector}: ${count} stocks`);
  });
  console.log(`\n✅ Total: ${stocks.length} stocks across ${Object.keys(sectorCounts).length} sectors`);

  // Create sample news
  const newsData = [
    {
      title: 'Indian Stock Markets Show Strong Growth',
      description: 'NSE and BSE indices reach new heights as investor confidence grows',
      url: 'https://example.com/news1',
      imageUrl: 'https://picsum.photos/800/400?random=1',
      source: 'Financial Times',
      publishedAt: new Date(),
    },
    {
      title: 'Tech Stocks Lead Market Rally',
      description: 'IT sector shows remarkable performance in Q4',
      url: 'https://example.com/news2',
      imageUrl: 'https://picsum.photos/800/400?random=2',
      source: 'Business Standard',
      publishedAt: new Date(Date.now() - 3600000),
    },
    {
      title: 'Banking Sector Sees Increased Activity',
      description: 'Major banks report strong quarterly earnings',
      url: 'https://example.com/news3',
      imageUrl: 'https://picsum.photos/800/400?random=3',
      source: 'Economic Times',
      publishedAt: new Date(Date.now() - 7200000),
    },
    {
      title: 'FII Inflows Boost Market Sentiment',
      description: 'Foreign institutional investors increase stake in Indian markets',
      url: 'https://example.com/news4',
      imageUrl: 'https://picsum.photos/800/400?random=4',
      source: 'Mint',
      publishedAt: new Date(Date.now() - 10800000),
    },
    {
      title: 'Nifty 50 Crosses Milestone',
      description: 'Index performance reflects strong economic indicators',
      url: 'https://example.com/news5',
      imageUrl: 'https://picsum.photos/800/400?random=5',
      source: 'Moneycontrol',
      publishedAt: new Date(Date.now() - 14400000),
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({ data: news });
  }

  console.log('✅ Created sample news');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin / admin123');
  console.log('User: testuser / test123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });