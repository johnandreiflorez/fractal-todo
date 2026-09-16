import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { esquemaLogin, esquemaRegistro } from '../validation/schemas.js';

export const authRouter = Router();

authRouter.post(
  '/registro',
  authLimiter,
  validate({ body: esquemaRegistro }),
  authController.registrar,
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: esquemaLogin }),
  authController.iniciarSesion,
);

authRouter.get('/perfil', requireAuth, authController.perfil);