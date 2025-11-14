import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkNews() {
  try {
    console.log('📰 Checking news articles in database...\n');

    const news = await prisma.news.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (news.length === 0) {
      console.log('⚠️ No news articles found in database');
      return;
    }

    console.log(`✅ Found ${news.length} news articles:\n`);
    console.log('━'.repeat(80));

    news.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.url || '❌ NO URL'}`);
      console.log(`   Source: ${article.source}`);
      console.log(`   Published: ${article.publishedAt}`);
      console.log('━'.repeat(80));
    });

  } catch (error) {
    console.error('❌ Error checking news:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNews();
