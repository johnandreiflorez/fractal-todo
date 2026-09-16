import {
  actualizar as repoActualizar,
  buscarPorId,
  crear as repoCrear,
  eliminar,
  listarPorUsuario,
} from '../repositories/categoria.repo.js';
import { conflicto, noEncontrado } from '../utils/httpError.js';
import type { Categoria } from '../models/categoria.js';

function esViolacionUnica(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === '23505';
}

export async function listarCategorias(usuarioId: number): Promise<Categoria[]> {
  return listarPorUsuario(usuarioId);
}

export async function crearCategoria(
  usuarioId: number,
  datos: { nombre: string; color?: string | null },
): Promise<Categoria> {
  try {
    return await repoCrear(usuarioId, datos);
  } catch (error) {
    if (esViolacionUnica(error)) {
      throw conflicto('Ya existe una categoría con ese nombre');
    }
    throw error;
  }
}

export async function actualizarCategoria(
  usuarioId: number,
  id: number,
  datos: { nombre?: string; color?: string | null },
): Promise<Categoria> {
  try {
    const categoria = await repoActualizar(id, usuarioId, datos);
    if (!categoria) throw noEncontrado('Categoría no encontrada');
    return categoria;
  } catch (error) {
    if (esViolacionUnica(error)) {
      throw conflicto('Ya existe una categoría con ese nombre');
    }
    throw error;
  }
}

export async function eliminarCategoria(usuarioId: number, id: number): Promise<void> {
  if (!(await buscarPorId(id))) {
    throw noEncontrado('Categoría no encontrada');
  }
  const eliminada = await eliminar(id, usuarioId);
  if (!eliminada) throw noEncontrado('Categoría no encontrada');
}