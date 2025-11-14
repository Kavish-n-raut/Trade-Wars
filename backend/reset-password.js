import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * Script to reset a user's password
 * Usage: node reset-password.js
 */

async function resetPassword() {
  try {
    console.log('🔐 Password Reset Tool\n');

    // Get username
    const username = await question('Enter username: ');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log(`\n❌ User "${username}" not found`);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    console.log(`\n✅ Found user: ${user.username} (${user.email})`);
    console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}\n`);

    // Get new password
    const newPassword = await question('Enter new password: ');
    const confirmPassword = await question('Confirm new password: ');

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Passwords do not match');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    if (newPassword.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    console.log('\n✅ Password updated successfully!');
    console.log(`   Username: ${username}`);
    console.log(`   New Password: ${newPassword}`);
    console.log('\n⚠️ Make sure to save this password - it cannot be retrieved later!\n');

  } catch (error) {
    console.error('\n❌ Error resetting password:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetPassword();
