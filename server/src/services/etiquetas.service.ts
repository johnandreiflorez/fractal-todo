import { crear, listarPorUsuario } from '../repositories/etiqueta.repo.js';
import { conflicto } from '../utils/httpError.js';
import type { Etiqueta } from '../models/etiqueta.js';

export async function listarEtiquetas(usuarioId: number): Promise<Etiqueta[]> {
  return listarPorUsuario(usuarioId);
}

export async function crearEtiqueta(
  usuarioId: number,
  nombre: string,
): Promise<Etiqueta> {
  try {
    return await crear(usuarioId, nombre);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      throw conflicto('Ya existe una etiqueta con ese nombre');
    }
    throw error;
  }
}