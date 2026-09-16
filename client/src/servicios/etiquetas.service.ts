import { clienteHttp } from '../api/cliente.js';
import { esEtiqueta } from '../tipos/index.js';
import type { Etiqueta } from '../tipos/index.js';

export async function listarEtiquetas(): Promise<Etiqueta[]> {
  const { data } = await clienteHttp.get('/etiquetas');
  if (!Array.isArray(data) || !data.every(esEtiqueta)) {
    throw new Error('Lista de etiquetas inválida');
  }
  return data;
}

export async function crearEtiqueta(nombre: string): Promise<Etiqueta> {
  const { data } = await clienteHttp.post('/etiquetas', { nombre });
  if (!esEtiqueta(data)) throw new Error('Etiqueta creada inválida');
  return data;
}