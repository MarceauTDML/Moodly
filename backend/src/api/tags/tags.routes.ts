import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { tagsController } from './tags.controllers';
import { tagCodeParamsSchema } from './tags.validators';

export const tagsRoutes = Router();

tagsRoutes.use(authenticate);

tagsRoutes.get('/', tagsController.list);
tagsRoutes.get('/:code', validate({ params: tagCodeParamsSchema }), tagsController.getByCode);
