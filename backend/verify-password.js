import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    const username = 'admin';
    const passwordsToTry = [
      'admin123',
      'SecureAdmin@2025',
      'kanabel',
      'kansabel'
    ];

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log('❌ User "admin" not found in database');
      return;
    }

    console.log('\n🔍 Testing passwords for user:', username);
    console.log('Password hash in DB:', user.password);
    console.log('\nTrying passwords:\n');

    for (const password of passwordsToTry) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log(`✅ SUCCESS! Password is: "${password}"`);
      } else {
        console.log(`❌ Not: "${password}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
