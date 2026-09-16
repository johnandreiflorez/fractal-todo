import { clienteHttp } from '../api/cliente.js';
import { esCategoria } from '../tipos/index.js';
import type { Categoria } from '../tipos/index.js';

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await clienteHttp.get('/categorias');
  if (!Array.isArray(data) || !data.every(esCategoria)) {
    throw new Error('Lista de categorías inválida');
  }
  return data;
}

export async function crearCategoria(datos: {
  nombre: string;
  color?: string | null;
}): Promise<Categoria> {
  const { data } = await clienteHttp.post('/categorias', datos);
  if (!esCategoria(data)) throw new Error('Categoría creada inválida');
  return data;
}

export async function actualizarCategoria(
  id: number,
  datos: { nombre?: string; color?: string | null },
): Promise<Categoria> {
  const { data } = await clienteHttp.put(`/categorias/${id}`, datos);
  if (!esCategoria(data)) throw new Error('Categoría actualizada inválida');
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await clienteHttp.delete(`/categorias/${id}`);
}