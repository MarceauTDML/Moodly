import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { moodsController } from './moods.controllers';
import { submitMoodSchema } from './moods.validators';

export const moodsRoutes = Router();

moodsRoutes.use(authenticate);

moodsRoutes.get('/options', moodsController.options);
moodsRoutes.get('/today', moodsController.today);
moodsRoutes.post('/', validate({ body: submitMoodSchema }), moodsController.submit);
