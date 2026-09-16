import { pool, type Queryable } from '../config/db.js';
import type { Etiqueta } from '../models/etiqueta.js';

function mapearFila(fila: Record<string, unknown>): Etiqueta {
  return {
    id: Number(fila.id),
    usuario_id: Number(fila.usuario_id),
    nombre: String(fila.nombre),
    creado_en: new Date(String(fila.creado_en)),
  };
}

export async function listarPorUsuario(
  usuarioId: number,
  client: Queryable = pool,
): Promise<Etiqueta[]> {
  const { rows } = await client.query(
    'SELECT * FROM etiquetas WHERE usuario_id = $1 ORDER BY nombre ASC',
    [usuarioId],
  );
  return rows.map((fila) => mapearFila(fila as Record<string, unknown>));
}

export async function buscarPorNombres(
  usuarioId: number,
  nombres: string[],
  client: Queryable = pool,
): Promise<Etiqueta[]> {
  if (nombres.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM etiquetas
     WHERE usuario_id = $1 AND nombre = ANY($2::text[])
     ORDER BY nombre ASC`,
    [usuarioId, nombres],
  );
  return rows.map((fila) => mapearFila(fila as Record<string, unknown>));
}

export async function crear(
  usuarioId: number,
  nombre: string,
  client: Queryable = pool,
): Promise<Etiqueta> {
  const { rows } = await client.query(
    `INSERT INTO etiquetas (usuario_id, nombre)
     VALUES ($1, $2)
     RETURNING *`,
    [usuarioId, nombre],
  );
  return mapearFila(rows[0] as Record<string, unknown>);
}

export async function crearSiNoExisten(
  usuarioId: number,
  nombres: string[],
  client: Queryable = pool,
): Promise<Etiqueta[]> {
  if (nombres.length === 0) return [];
  const existentes = await buscarPorNombres(usuarioId, nombres, client);
  const existentesSet = new Set(existentes.map((e) => e.nombre.toLowerCase()));
  const faltantes = [...new Set(nombres.map((n) => n.trim()))].filter(
    (n) => !existentesSet.has(n.toLowerCase()),
  );
  const creadas: Etiqueta[] = [];
  for (const nombre of faltantes) {
    creadas.push(await crear(usuarioId, nombre, client));
  }
  return [...creadas, ...existentes];
}

export async function reemplazarDeTarea(
  tareaId: number,
  etiquetaIds: number[],
  client: Queryable = pool,
): Promise<void> {
  await client.query('DELETE FROM tarea_etiquetas WHERE tarea_id = $1', [tareaId]);
  for (const etiquetaId of etiquetaIds) {
    await client.query(
      `INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tareaId, etiquetaId],
    );
  }
}

export async function agregarATarea(
  tareaId: number,
  etiquetaIds: number[],
  client: Queryable = pool,
): Promise<void> {
  for (const etiquetaId of etiquetaIds) {
    await client.query(
      `INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tareaId, etiquetaId],
    );
  }
}

export async function eliminarSiNoUsadas(
  usuarioId: number,
  client: Queryable = pool,
): Promise<void> {
  await client.query(
    `DELETE FROM etiquetas
     WHERE usuario_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM tarea_etiquetas te WHERE te.etiqueta_id = etiquetas.id
       )`,
    [usuarioId],
  );
}