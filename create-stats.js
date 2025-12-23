import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createStats() {
  try {
    await prisma.videoStats.create({
      data: {
        vidID: 4n,
        viewsCount: 0n,
        likesCount: 0n,
        commentsCount: 0n,
        sharesCount: 0n
      }
    });
    console.log('✅ VideoStats created for video ID 4');
  } catch (e) {
    if (e.code === 'P2002') {
      console.log('✅ VideoStats already exists for video ID 4');
    } else {
      console.error('❌ Error:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createStats();
