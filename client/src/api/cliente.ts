import axios, { AxiosError } from 'axios';
import { limpiarSesion, obtenerToken } from '../utils/authStorage.js';

export const clienteHttp = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

clienteHttp.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      limpiarSesion();
      window.dispatchEvent(new Event('auth:no-autorizado'));
    }
    return Promise.reject(error);
  },
);

export function mensajeDeError(error: unknown): string {
  if (error instanceof AxiosError) {
    const datos = error.response?.data as { error?: string } | undefined;
    return datos?.error ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}