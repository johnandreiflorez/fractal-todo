import { Router } from 'express';
import * as etiquetasController from '../controllers/etiquetas.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { esquemaNuevaEtiqueta } from '../validation/schemas.js';

export const etiquetasRouter = Router();

etiquetasRouter.use(requireAuth);

etiquetasRouter.get('/', etiquetasController.listar);

etiquetasRouter.post(
  '/',
  validate({ body: esquemaNuevaEtiqueta }),
  etiquetasController.crear,
);