import authRouter from './api/auth/auth.routes';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { moodsRoutes } from './api/moods/moods.routes';
import { passwordRoutes } from './api/password/password.routes';
import { tagsRoutes } from './api/tags/tags.routes';
import { teamsRoutes } from './api/teams/teams.routes';
import { usersRoutes } from './api/users/users.routes';
import { env, isTest } from './config/env.config';
import { logger } from './config/logger.config';
import { prisma } from './config/prisma.config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  if (!isTest) app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

  app.get('/health', async (_req, res) => {
    let database: 'up' | 'down' = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    res.status(database === 'up' ? 200 : 503).json({ status: database === 'up' ? 'ok' : 'degraded', database, uptime: process.uptime() });
  });

  const api = express.Router();
  api.use(apiLimiter);
  api.use('/auth', authRouter);
  api.use('/users', usersRoutes);
  api.use('/password', passwordRoutes);
  api.use('/teams', teamsRoutes);
  api.use('/tags', tagsRoutes);
  api.use('/moods', moodsRoutes);
  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
