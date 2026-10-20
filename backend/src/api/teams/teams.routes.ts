import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { teamScope } from '../../middlewares/teamScope.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { teamsController } from './teams.controllers';
import {
  addMemberSchema,
  createTeamSchema,
  memberParamsSchema,
  teamIdParamsSchema,
  updateMemberSchema,
  updateTeamSchema,
} from './teams.validators';

export const teamsRoutes = Router();

teamsRoutes.use(authenticate);

const adminOnTeam = [requireRole('ADMIN'), teamScope()];

teamsRoutes.get('/', teamsController.list);
teamsRoutes.post('/', requireRole('ADMIN'), validate({ body: createTeamSchema }), teamsController.create);

teamsRoutes.get('/:teamId', validate({ params: teamIdParamsSchema }), teamScope({ allowMembers: true }), teamsController.get);
teamsRoutes.patch('/:teamId', validate({ params: teamIdParamsSchema, body: updateTeamSchema }), ...adminOnTeam, teamsController.update);
teamsRoutes.delete('/:teamId', validate({ params: teamIdParamsSchema }), ...adminOnTeam, teamsController.remove);

teamsRoutes.post(
  '/:teamId/members',
  validate({ params: teamIdParamsSchema, body: addMemberSchema }),
  ...adminOnTeam,
  teamsController.addMember,
);
teamsRoutes.patch(
  '/:teamId/members/:userId',
  validate({ params: memberParamsSchema, body: updateMemberSchema }),
  ...adminOnTeam,
  teamsController.updateMember,
);
teamsRoutes.delete(
  '/:teamId/members/:userId',
  validate({ params: memberParamsSchema }),
  ...adminOnTeam,
  teamsController.removeMember,
);
