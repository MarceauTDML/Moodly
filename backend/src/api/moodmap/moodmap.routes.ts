import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { teamScope } from '../../middlewares/teamScope.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { moodmapController } from './moodmap.controllers';
import { historyQuerySchema, optionalTeamParamsSchema } from './moodmap.validators';

export const moodmapRoutes = Router();

moodmapRoutes.use(authenticate, requireRole('MANAGER', 'ADMIN'));

const scoped = [validate({ params: optionalTeamParamsSchema }), teamScope()];

moodmapRoutes.get(['/summary', '/teams/:teamId/summary'], ...scoped, moodmapController.summary);

moodmapRoutes.get(
  ['/history', '/teams/:teamId/history'],
  validate({ params: optionalTeamParamsSchema, query: historyQuerySchema }),
  teamScope(),
  moodmapController.history,
);
