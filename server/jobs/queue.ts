import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '@/server/logger';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

export const reminderQueue = new Queue('reminders', { connection });

new Worker(
  'reminders',
  async (job) => {
    logger.info({ jobId: job.id, data: job.data }, 'Processando lembrete de atividade');
    // TODO: integrar com SMTP/serviço de notificações
  },
  { connection }
);
