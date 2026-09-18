import { Router } from 'express';
import * as estadisticasController from '../controllers/estadisticas.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const estadisticasRouter = Router();

estadisticasRouter.use(requireAuth);

estadisticasRouter.get('/', estadisticasController.obtener);
