import { PrismaClient } from '@prisma/client';
import { logger } from '@/server/logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$use(async (params, next) => {
  const before = performance.now();
  const result = await next(params);
  const after = performance.now();
  logger.debug({ model: params.model, action: params.action, duration: after - before }, 'prisma query');
  return result;
});
