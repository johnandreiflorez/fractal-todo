import { clienteHttp } from '../api/cliente.js';
import { esSesion, esUsuarioLogueado } from '../tipos/index.js';
import type { Sesion, UsuarioLogueado } from '../tipos/index.js';

interface Credenciales {
  email: string;
  password: string;
}

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export async function registrar(datos: DatosRegistro): Promise<Sesion> {
  const { data } = await clienteHttp.post('/auth/registro', datos);
  if (!esSesion(data)) {
    throw new Error('Respuesta de registro inválida');
  }
  return data;
}

export async function iniciarSesion(credenciales: Credenciales): Promise<Sesion> {
  const { data } = await clienteHttp.post('/auth/login', credenciales);
  if (!esSesion(data)) {
    throw new Error('Respuesta de inicio de sesión inválida');
  }
  return data;
}

export async function obtenerPerfil(): Promise<UsuarioLogueado> {
  const { data } = await clienteHttp.get('/auth/perfil');
  if (!esUsuarioLogueado(data)) {
    throw new Error('Perfil inválido');
  }
  return data;
}