import { PrismaClient } from '@prisma/client';
import nifty50Data from './nifty50.js';

const prisma = new PrismaClient();

async function resetAndSeed() {
  try {
    console.log('🔄 Resetting database...');

    // Delete all data
    await prisma.transaction.deleteMany({});
    await prisma.holding.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.news.deleteMany({});
    
    // DON'T delete users - keep existing ones
    
    console.log('✅ Cleared transactions, holdings, stocks, and news');

    // Reset stock ID sequence to 1
    await prisma.$executeRawUnsafe(`
      ALTER SEQUENCE "Stock_id_seq" RESTART WITH 1;
    `);
    console.log('✅ Reset stock ID sequence');

    // Create stocks
    console.log(`📊 Creating ${nifty50Data.length} stocks...`);
    for (const stockData of nifty50Data) {
      await prisma.stock.create({
        data: stockData,
      });
    }
    console.log(`✅ Created ${nifty50Data.length} stocks`);

    // Count stocks by sector
    const stocks = await prisma.stock.findMany();
    const sectorCounts = stocks.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Stock Distribution:');
    Object.entries(sectorCounts).forEach(([sector, count]) => {
      console.log(`  ${sector}: ${count} stocks`);
    });

    console.log(`\n✅ Total: ${stocks.length} stocks across ${Object.keys(sectorCounts).length} sectors`);

    // Show existing users
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, isAdmin: true }
    });
    console.log(`\n👥 Existing users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.username} (ID: ${user.id}${user.isAdmin ? ', ADMIN' : ''})`);
    });

  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeed()
  .catch(console.error);
