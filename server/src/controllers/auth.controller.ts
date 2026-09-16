import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { idUsuarioLogueado } from '../utils/requestUser.js';
import type { LoginInput, RegistroInput } from '../models/usuario.js';

type CuerpoRegistro = Request<Record<string, never>, unknown, RegistroInput>;
type CuerpoLogin = Request<Record<string, never>, unknown, LoginInput>;

export async function registrar(req: CuerpoRegistro, res: Response): Promise<void> {
  const sesion = await authService.registrar(req.body);
  res.status(201).json(sesion);
}

export async function iniciarSesion(req: CuerpoLogin, res: Response): Promise<void> {
  const sesion = await authService.iniciarSesion(req.body);
  res.json(sesion);
}

export async function perfil(req: Request, res: Response): Promise<void> {
  const usuario = await authService.obtenerPerfil(idUsuarioLogueado(req));
  res.json(usuario);
}