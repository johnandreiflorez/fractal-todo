import { pool, type Queryable } from '../config/db.js';
import type { Categoria } from '../models/categoria.js';

function mapearFila(fila: Record<string, unknown>): Categoria {
  return {
    id: Number(fila.id),
    usuario_id: Number(fila.usuario_id),
    nombre: String(fila.nombre),
    color: fila.color ? String(fila.color) : null,
    creado_en: new Date(String(fila.creado_en)),
    actualizado_en: new Date(String(fila.actualizado_en)),
  };
}

export async function listarPorUsuario(
  usuarioId: number,
  client: Queryable = pool,
): Promise<Categoria[]> {
  const { rows } = await client.query(
    'SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nombre ASC',
    [usuarioId],
  );
  return rows.map((fila) => mapearFila(fila as Record<string, unknown>));
}

export async function buscarPorId(
  id: number,
  client: Queryable = pool,
): Promise<Categoria | null> {
  const { rows } = await client.query(
    'SELECT * FROM categorias WHERE id = $1',
    [id],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  return fila ? mapearFila(fila) : null;
}

export async function crear(
  usuarioId: number,
  datos: { nombre: string; color?: string | null },
  client: Queryable = pool,
): Promise<Categoria> {
  const { rows } = await client.query(
    `INSERT INTO categorias (usuario_id, nombre, color)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [usuarioId, datos.nombre, datos.color ?? null],
  );
  return mapearFila(rows[0] as Record<string, unknown>);
}

export async function actualizar(
  id: number,
  usuarioId: number,
  datos: { nombre?: string; color?: string | null },
  client: Queryable = pool,
): Promise<Categoria | null> {
  const { rows } = await client.query(
    `UPDATE categorias
     SET nombre = COALESCE($3, nombre),
         color = COALESCE($4, color)
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    [id, usuarioId, datos.nombre ?? null, datos.color ?? null],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  return fila ? mapearFila(fila) : null;
}

export async function eliminar(
  id: number,
  usuarioId: number,
  client: Queryable = pool,
): Promise<boolean> {
  const { rowCount } = await client.query(
    'DELETE FROM categorias WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId],
  );
  return (rowCount ?? 0) > 0;
}

export async function perteneceAlUsuario(
  id: number,
  usuarioId: number,
  client: Queryable = pool,
): Promise<boolean> {
  const { rows } = await client.query(
    'SELECT 1 FROM categorias WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId],
  );
  return rows.length > 0;
}