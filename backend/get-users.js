import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script to retrieve all user credentials
 * ⚠️ WARNING: Passwords are hashed (bcrypt) and CANNOT be decrypted
 * You can only verify passwords, not retrieve the original plain text
 */

async function getUsers() {
  try {
    console.log('📋 Fetching all users from database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        balance: true,
        portfolioValue: true,
        profitLoss: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('⚠️ No users found in database');
      return;
    }

    console.log(`✅ Found ${users.length} users:\n`);
    console.log('━'.repeat(80));

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.isAdmin ? '👑 ADMIN' : '👤 USER'}: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Balance: ₹${user.balance.toLocaleString('en-IN')}`);
      console.log(`   Portfolio Value: ₹${user.portfolioValue.toLocaleString('en-IN')}`);
      console.log(`   Profit/Loss: ₹${user.profitLoss.toLocaleString('en-IN')}`);
      console.log(`   Registered: ${user.createdAt.toLocaleString()}`);
      console.log('━'.repeat(80));
    });

    console.log('\n⚠️ IMPORTANT: Passwords are hashed with bcrypt and CANNOT be retrieved.');
    console.log('💡 If a user forgets their password, you have 2 options:');
    console.log('   1. Implement a password reset feature (recommended)');
    console.log('   2. Manually update their password using reset-password.js script\n');

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();
