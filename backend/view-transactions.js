import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function viewTransactions() {
  try {
    console.log('📊 Fetching all transactions...\n');
    
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        },
        stock: {
          select: {
            symbol: true,
            companyName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 transactions
    });

    console.log(`Found ${transactions.length} transactions:\n`);
    
    transactions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.type.toUpperCase()} | ${t.user.username} | ${t.stock.symbol}`);
      console.log(`   Quantity: ${t.quantity} @ ₹${t.price} = ₹${t.totalAmount}`);
      console.log(`   P/L: ₹${t.profitLoss || 0}`);
      console.log(`   Time: ${t.createdAt.toLocaleString()}`);
      console.log('');
    });

    const summary = await prisma.transaction.aggregate({
      _count: true,
      _sum: {
        totalAmount: true,
        profitLoss: true,
      }
    });

    console.log('\n📈 Summary:');
    console.log(`Total Transactions: ${summary._count}`);
    console.log(`Total Volume: ₹${summary._sum.totalAmount?.toFixed(2) || 0}`);
    console.log(`Total P/L: ₹${summary._sum.profitLoss?.toFixed(2) || 0}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewTransactions();
