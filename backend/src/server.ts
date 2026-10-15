import { createApp } from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { prisma } from './config/prisma.config';

const bootstrap = async () => {
  await prisma.$connect();
  logger.info('Connexion PostgreSQL établie');

  const server = createApp().listen(env.PORT, () => {
    logger.info(`API Mood Map démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} reçu, arrêt en cours…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Promesse rejetée non gérée'));

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Impossible de démarrer le serveur');
  process.exit(1);
});
