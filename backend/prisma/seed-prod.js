// Idempotent production seed. Safe to run on every deploy: it only creates
// missing rows and never deletes. Live data (stock prices moved by the admin
// panel or cron, registered users, transactions) is left untouched.
//
// Admin credentials can be overridden with ADMIN_USERNAME / ADMIN_PASSWORD /
// ADMIN_EMAIL env vars; otherwise the defaults below are used.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nifty50Data from './nifty50.js';

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kansabel';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kanabel';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ecellrvitm.in';

async function ensureAdmin() {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: ADMIN_EMAIL }, { username: ADMIN_USERNAME }] },
  });
  if (existing) {
    if (!existing.isAdmin) {
      await prisma.user.update({ where: { id: existing.id }, data: { isAdmin: true } });
      console.log(`  promoted existing user "${existing.username}" to admin`);
    } else {
      console.log(`  admin "${existing.username}" already present`);
    }
    return;
  }
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password,
      isAdmin: true,
      balance: 500000,
      portfolioValue: 500000,
      profitLoss: 0,
    },
  });
  console.log(`  created admin "${ADMIN_USERNAME}"`);
}

async function ensureStocks() {
  let created = 0;
  for (const s of nifty50Data) {
    const res = await prisma.stock.upsert({
      where: { symbol: s.symbol },
      // Only refresh descriptive fields on update — never overwrite a live price.
      update: { name: s.name, sector: s.sector },
      create: {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        currentPrice: s.price,
        openPrice: s.price * 0.99,
        high: s.price * 1.02,
        low: s.price * 0.98,
        change: s.price * 0.01,
        changePercent: 1.0,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        isTracking: true,
        lastUpdated: new Date(),
      },
    });
    if (res.createdAt.getTime() === res.updatedAt.getTime()) created += 1;
  }
  console.log(`  stocks: ${nifty50Data.length} ensured (${created} newly created)`);
}

async function ensureNews() {
  const now = Date.now();
  const items = [
    { title: 'Indian Stock Markets Show Strong Growth', description: 'NSE and BSE indices reach new heights as investor confidence grows', url: 'https://example.com/news1', imageUrl: 'https://picsum.photos/800/400?random=1', source: 'Financial Times', publishedAt: new Date(now) },
    { title: 'Tech Stocks Lead Market Rally', description: 'IT sector shows remarkable performance in Q4', url: 'https://example.com/news2', imageUrl: 'https://picsum.photos/800/400?random=2', source: 'Business Standard', publishedAt: new Date(now - 3600000) },
    { title: 'Banking Sector Sees Increased Activity', description: 'Major banks report strong quarterly earnings', url: 'https://example.com/news3', imageUrl: 'https://picsum.photos/800/400?random=3', source: 'Economic Times', publishedAt: new Date(now - 7200000) },
    { title: 'FII Inflows Boost Market Sentiment', description: 'Foreign institutional investors increase stake in Indian markets', url: 'https://example.com/news4', imageUrl: 'https://picsum.photos/800/400?random=4', source: 'Mint', publishedAt: new Date(now - 10800000) },
    { title: 'Nifty 50 Crosses Milestone', description: 'Index performance reflects strong economic indicators', url: 'https://example.com/news5', imageUrl: 'https://picsum.photos/800/400?random=5', source: 'Moneycontrol', publishedAt: new Date(now - 14400000) },
  ];
  for (const n of items) {
    await prisma.news.upsert({ where: { url: n.url }, update: {}, create: n });
  }
  console.log(`  news: ${items.length} sample items ensured`);
}

async function main() {
  console.log('🌱 Idempotent seed starting...');
  await ensureAdmin();
  await ensureStocks();
  await ensureNews();
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
