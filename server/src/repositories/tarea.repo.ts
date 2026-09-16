import { pool, type Queryable } from '../config/db.js';
import type {
  ActualizarTarea,
  CambiosLote,
  FilaTarea,
  FiltrosTareas,
  NuevaTarea,
} from '../models/tarea.js';

const SELECT_CON_RELACIONES = `
SELECT
  t.id,
  t.usuario_id,
  t.categoria_id,
  t.titulo,
  t.descripcion,
  t.prioridad,
  t.completada,
  t.fecha_vencimiento,
  t.completada_en,
  t.creado_en,
  t.actualizado_en,
  c.nombre AS categoria_nombre,
  c.color AS categoria_color,
  COALESCE(array_agg(e.nombre) FILTER (WHERE e.id IS NOT NULL), '{}') AS etiquetas
FROM tareas t
LEFT JOIN categorias c ON c.id = t.categoria_id
LEFT JOIN tarea_etiquetas te ON te.tarea_id = t.id
LEFT JOIN etiquetas e ON e.id = te.etiqueta_id
`;

const COLUMNAS_ORDEN: Record<string, string> = {
  creado_en: 't.creado_en',
  fecha_vencimiento: 't.fecha_vencimiento',
  prioridad: 't.prioridad',
  titulo: 't.titulo',
};

function aFechaISO(valor: unknown): string | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  const texto = String(valor).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(texto) ? texto : String(valor);
}

function mapearFila(fila: Record<string, unknown>): FilaTarea {
  return {
    id: Number(fila.id),
    usuario_id: Number(fila.usuario_id),
    categoria_id: fila.categoria_id ? Number(fila.categoria_id) : null,
    titulo: String(fila.titulo),
    descripcion: fila.descripcion ? String(fila.descripcion) : null,
    prioridad: Number(fila.prioridad),
    completada: Boolean(fila.completada),
    fecha_vencimiento: aFechaISO(fila.fecha_vencimiento),
    completada_en: fila.completada_en ? new Date(String(fila.completada_en)) : null,
    creado_en: new Date(String(fila.creado_en)),
    actualizado_en: new Date(String(fila.actualizado_en)),
    etiquetas: Array.isArray(fila.etiquetas) ? fila.etiquetas.map(String) : [],
    categoria_nombre: fila.categoria_nombre ? String(fila.categoria_nombre) : null,
    categoria_color: fila.categoria_color ? String(fila.categoria_color) : null,
  };
}

export async function listar(
  filtros: FiltrosTareas,
  client: Queryable = pool,
): Promise<FilaTarea[]> {
  const condiciones: string[] = ['t.usuario_id = $1'];
  const valores: unknown[] = [filtros.usuario_id];

  if (filtros.completada !== undefined) {
    valores.push(filtros.completada);
    condiciones.push(`t.completada = $${valores.length}`);
  }
  if (filtros.categoria_id !== undefined) {
    valores.push(filtros.categoria_id);
    condiciones.push(`t.categoria_id = $${valores.length}`);
  }
  if (filtros.prioridad !== undefined) {
    valores.push(filtros.prioridad);
    condiciones.push(`t.prioridad = $${valores.length}`);
  }
  if (filtros.desde !== undefined) {
    valores.push(filtros.desde);
    condiciones.push(`t.fecha_vencimiento >= $${valores.length}::date`);
  }
  if (filtros.hasta !== undefined) {
    valores.push(filtros.hasta);
    condiciones.push(`t.fecha_vencimiento <= $${valores.length}::date`);
  }
  if (filtros.busqueda !== undefined && filtros.busqueda.trim() !== '') {
    valores.push(`%${filtros.busqueda.trim().toLowerCase()}%`);
    condiciones.push(
      `(LOWER(t.titulo) LIKE $${valores.length} OR LOWER(t.descripcion) LIKE $${valores.length})`,
    );
  }
  if (filtros.etiquetas !== undefined && filtros.etiquetas.length > 0) {
    valores.push(filtros.etiquetas);
    condiciones.push(
      `t.id IN (
        SELECT te2.tarea_id
        FROM tarea_etiquetas te2
        JOIN etiquetas e2 ON e2.id = te2.etiqueta_id
        WHERE e2.usuario_id = t.usuario_id
          AND e2.nombre = ANY($${valores.length}::text[])
      )`,
    );
  }

  const columnaOrden = COLUMNAS_ORDEN[filtros.ordenar ?? 'creado_en'] ?? 't.creado_en';
  const direccion = filtros.direccion === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    ${SELECT_CON_RELACIONES}
    WHERE ${condiciones.join(' AND ')}
    GROUP BY t.id, c.nombre, c.color
    ORDER BY ${columnaOrden} ${direccion}, t.id ${direccion}
  `;

  const { rows } = await client.query(sql, valores);
  return rows.map((fila) => mapearFila(fila as Record<string, unknown>));
}

export async function obtenerDetallada(
  id: number,
  usuarioId: number,
  client: Queryable = pool,
): Promise<FilaTarea | null> {
  const { rows } = await client.query(
    `
    ${SELECT_CON_RELACIONES}
    WHERE t.id = $1 AND t.usuario_id = $2
    GROUP BY t.id, c.nombre, c.color
    `,
    [id, usuarioId],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  return fila ? mapearFila(fila) : null;
}

export async function crear(
  datos: NuevaTarea,
  etiquetaIds: number[],
  client: Queryable = pool,
): Promise<FilaTarea> {
  const { rows } = await client.query(
    `INSERT INTO tareas (
       usuario_id, titulo, descripcion, prioridad, categoria_id, fecha_vencimiento
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      datos.usuario_id,
      datos.titulo,
      datos.descripcion ?? null,
      datos.prioridad ?? 3,
      datos.categoria_id ?? null,
      datos.fecha_vencimiento ?? null,
    ],
  );
  const tarea = rows[0] as Record<string, unknown>;
  for (const etiquetaId of etiquetaIds) {
    await client.query(
      `INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tarea.id, etiquetaId],
    );
  }
  return {
    ...mapearFila(tarea),
    etiquetas: [],
    categoria_nombre: null,
    categoria_color: null,
  };
}

export async function actualizar(
  id: number,
  usuarioId: number,
  cambios: ActualizarTarea,
  client: Queryable = pool,
): Promise<FilaTarea | null> {
  const sets: string[] = [];
  const valores: unknown[] = [id, usuarioId];

  if (cambios.titulo !== undefined) {
    valores.push(cambios.titulo);
    sets.push(`titulo = $${valores.length}`);
  }
  if (cambios.descripcion !== undefined) {
    valores.push(cambios.descripcion ?? null);
    sets.push(`descripcion = $${valores.length}`);
  }
  if (cambios.prioridad !== undefined) {
    valores.push(cambios.prioridad);
    sets.push(`prioridad = $${valores.length}`);
  }
  if (cambios.categoria_id !== undefined) {
    valores.push(cambios.categoria_id ?? null);
    sets.push(`categoria_id = $${valores.length}`);
  }
  if (cambios.fecha_vencimiento !== undefined) {
    valores.push(cambios.fecha_vencimiento ?? null);
    sets.push(`fecha_vencimiento = $${valores.length}`);
  }

  if (sets.length === 0) {
    const actual = await obtenerDetallada(id, usuarioId, client);
    if (!actual) return null;
    return cambios.etiquetas ? { ...actual, etiquetas: cambios.etiquetas } : actual;
  }

  const { rows } = await client.query(
    `UPDATE tareas
     SET ${sets.join(', ')}
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    valores,
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  if (!fila) return null;
  return {
    ...mapearFila(fila),
    etiquetas: [],
    categoria_nombre: null,
    categoria_color: null,
  };
}

export async function cambiarCompletado(
  id: number,
  usuarioId: number,
  completada: boolean,
  client: Queryable = pool,
): Promise<FilaTarea | null> {
  const { rows } = await client.query(
    `UPDATE tareas
     SET completada = $3,
         completada_en = CASE WHEN $3 THEN NOW() ELSE NULL END
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    [id, usuarioId, completada],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  if (!fila) return null;
  return {
    ...mapearFila(fila),
    etiquetas: [],
    categoria_nombre: null,
    categoria_color: null,
  };
}

export async function eliminar(
  id: number,
  usuarioId: number,
  client: Queryable = pool,
): Promise<boolean> {
  const { rowCount } = await client.query(
    'DELETE FROM tareas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId],
  );
  return (rowCount ?? 0) > 0;
}

export async function eliminarLote(
  ids: number[],
  usuarioId: number,
  client: Queryable = pool,
): Promise<number> {
  const { rowCount } = await client.query(
    'DELETE FROM tareas WHERE id = ANY($1::int[]) AND usuario_id = $2',
    [ids, usuarioId],
  );
  return rowCount ?? 0;
}

export async function actualizarLote(
  ids: number[],
  usuarioId: number,
  cambios: CambiosLote,
  client: Queryable = pool,
): Promise<number> {
  const sets: string[] = [];
  const valores: unknown[] = [ids, usuarioId];

  if (cambios.completada !== undefined) {
    valores.push(cambios.completada);
    sets.push(`completada = $${valores.length}`);
    sets.push(`completada_en = CASE WHEN $${valores.length} THEN NOW() ELSE NULL END`);
  }
  if (cambios.prioridad !== undefined) {
    valores.push(cambios.prioridad);
    sets.push(`prioridad = $${valores.length}`);
  }
  if (cambios.categoria_id !== undefined) {
    valores.push(cambios.categoria_id ?? null);
    sets.push(`categoria_id = $${valores.length}`);
  }

  if (sets.length === 0) return 0;

  const { rowCount } = await client.query(
    `UPDATE tareas
     SET ${sets.join(', ')}
     WHERE id = ANY($1::int[]) AND usuario_id = $2`,
    valores,
  );
  return rowCount ?? 0;
}

export async function pertenecenAlUsuario(
  ids: number[],
  usuarioId: number,
  client: Queryable = pool,
): Promise<number[]> {
  if (ids.length === 0) return [];
  const { rows } = await client.query(
    'SELECT id FROM tareas WHERE id = ANY($1::int[]) AND usuario_id = $2',
    [ids, usuarioId],
  );
  return rows.map((fila) => Number((fila as Record<string, unknown>).id));
}

export async function obtenerEtiquetasDeTarea(
  id: number,
  client: Queryable = pool,
): Promise<string[]> {
  const { rows } = await client.query(
    `SELECT e.nombre
     FROM etiquetas e
     JOIN tarea_etiquetas te ON te.etiqueta_id = e.id
     WHERE te.tarea_id = $1
     ORDER BY e.nombre ASC`,
    [id],
  );
  return rows.map((fila) => String((fila as Record<string, unknown>).nombre));
}