import { Router } from 'express';
import * as tareasController from '../controllers/tareas.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  esquemaActualizarTarea,
  esquemaBatch,
  esquemaBatchEliminar,
  esquemaCompletar,
  esquemaNuevaTarea,
  esquemaParamId,
} from '../validation/schemas.js';

export const tareasRouter = Router();

tareasRouter.use(requireAuth);

tareasRouter.get('/', tareasController.listar);

tareasRouter.post(
  '/',
  validate({ body: esquemaNuevaTarea }),
  tareasController.crear,
);

tareasRouter.patch(
  '/batch',
  validate({ body: esquemaBatch }),
  tareasController.actualizarEnLote,
);

tareasRouter.post(
  '/batch/eliminar',
  validate({ body: esquemaBatchEliminar }),
  tareasController.eliminarEnLote,
);

tareasRouter.patch(
  '/:id/completar',
  validate({ params: esquemaParamId, body: esquemaCompletar }),
  tareasController.completar,
);

tareasRouter.put(
  '/:id',
  validate({ params: esquemaParamId, body: esquemaActualizarTarea }),
  tareasController.actualizar,
);

tareasRouter.delete(
  '/:id',
  validate({ params: esquemaParamId }),
  tareasController.eliminar,
);