import {
  buscarPorEmail,
  buscarPorId,
  crearUsuario,
  registrarUltimoLogin,
} from '../repositories/usuario.repo.js';
import { firmarAccessToken } from '../utils/jwt.js';
import { hashPassword, verificarPassword } from '../utils/password.js';
import { conflicto, noAutorizado, noEncontrado } from '../utils/httpError.js';
import type { LoginInput, RegistroInput, UsuarioLogueado } from '../models/usuario.js';

export interface Sesion {
  token: string;
  usuario: UsuarioLogueado;
}

function construirSesion(usuario: {
  id: number;
  nombre: string;
  email: string;
}): Sesion {
  const logueado: UsuarioLogueado = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
  };
  return { usuario: logueado, token: firmarAccessToken(logueado) };
}

export async function registrar(datos: RegistroInput): Promise<Sesion> {
  const existente = await buscarPorEmail(datos.email);
  if (existente) {
    throw conflicto('Ya existe una cuenta con ese email');
  }

  const hash = await hashPassword(datos.password);
  const usuario = await crearUsuario({
    nombre: datos.nombre,
    email: datos.email,
    passwordHash: hash,
  });

  return construirSesion(usuario);
}

export async function iniciarSesion(datos: LoginInput): Promise<Sesion> {
  const usuario = await buscarPorEmail(datos.email);
  if (!usuario) {
    throw noAutorizado('Credenciales inválidas');
  }

  const passwordValida = await verificarPassword(datos.password, usuario.password_hash);
  if (!passwordValida) {
    throw noAutorizado('Credenciales inválidas');
  }

  await registrarUltimoLogin(usuario.id);
  return construirSesion(usuario);
}

export async function obtenerPerfil(usuarioId: number): Promise<UsuarioLogueado> {
  const usuario = await buscarPorId(usuarioId);
  if (!usuario) {
    throw noEncontrado('Usuario no encontrado');
  }
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
}