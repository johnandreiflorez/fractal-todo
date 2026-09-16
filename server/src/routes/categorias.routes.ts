import { Router } from 'express';
import * as categoriasController from '../controllers/categorias.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  esquemaActualizarCategoria,
  esquemaNuevaCategoria,
  esquemaParamId,
} from '../validation/schemas.js';

export const categoriasRouter = Router();

categoriasRouter.use(requireAuth);

categoriasRouter.get('/', categoriasController.listar);

categoriasRouter.post(
  '/',
  validate({ body: esquemaNuevaCategoria }),
  categoriasController.crear,
);

categoriasRouter.put(
  '/:id',
  validate({ params: esquemaParamId, body: esquemaActualizarCategoria }),
  categoriasController.actualizar,
);

categoriasRouter.delete(
  '/:id',
  validate({ params: esquemaParamId }),
  categoriasController.eliminar,
);