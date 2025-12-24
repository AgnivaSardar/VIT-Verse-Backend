// check-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDB() {
  try {
    const userCount = await prisma.users.count();
    const agniva = await prisma.users.findFirst({
      where: { userEmail: { contains: 'agniva' } }
    });
    
    console.log('🗄️  ACTIVE DATABASE INFO:');
    console.log('Total users:', userCount);
    console.log('Agniva exists:', !!agniva);
    console.log('DB connection:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
    
    // Test write
    await prisma.users.updateMany({ where: { userID: 999 }, data: { userName: 'test' } });
    console.log('✅ WRITE TEST: No error = ACTIVE DB confirmed');
  } catch (error) {
    console.error('❌ DB ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
