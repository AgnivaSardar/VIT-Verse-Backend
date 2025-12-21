// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

type PrismaSingleton = {
  getPrismaClient(): PrismaClient;
};

const globalForPrisma = globalThis as unknown as PrismaSingleton & {
  prismaClient?: PrismaClient;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    errorFormat: 'pretty',
  });
} else {
  if (!globalForPrisma.prismaClient) {
    globalForPrisma.prismaClient = new PrismaClient({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = globalForPrisma.prismaClient;
}

export default prisma;
export { prisma };
