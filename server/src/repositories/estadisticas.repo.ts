import { pool, type Queryable } from '../config/db.js';
import { esPrioridad } from '../models/tarea.js';
import type {
  EstadisticaCategoria,
  EstadisticaPrioridad,
  ResumenEstadisticas,
} from '../models/estadistica.js';

type FilaResumen = {
  total: number;
  completadas: number;
  pendientes: number;
  vencidas: number;
};

type FilaPrioridad = {
  prioridad: number;
  total: number;
  completadas: number;
};

type FilaCategoria = {
  categoria_id: number | null;
  categoria_nombre: string | null;
  categoria_color: string | null;
  total: number;
  completadas: number;
};

export async function obtenerResumen(
  usuarioId: number,
  client: Queryable = pool,
): Promise<ResumenEstadisticas> {
  const { rows } = await client.query<FilaResumen>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE completada)::int AS completadas,
       COUNT(*) FILTER (WHERE NOT completada)::int AS pendientes,
       COUNT(*) FILTER (WHERE NOT completada AND fecha_vencimiento < CURRENT_DATE)::int AS vencidas
     FROM tareas
     WHERE usuario_id = $1`,
    [usuarioId],
  );

  const fila = rows[0];
  const total = Number(fila?.total ?? 0);
  const completadas = Number(fila?.completadas ?? 0);

  return {
    total,
    completadas,
    pendientes: Number(fila?.pendientes ?? 0),
    vencidas: Number(fila?.vencidas ?? 0),
    tasa_completado: total > 0 ? Math.round((completadas / total) * 1000) / 10 : 0,
  };
}

export async function agruparPorPrioridad(
  usuarioId: number,
  client: Queryable = pool,
): Promise<EstadisticaPrioridad[]> {
  const { rows } = await client.query<FilaPrioridad>(
    `SELECT
       p.prioridad,
       COUNT(t.id)::int AS total,
       COUNT(t.id) FILTER (WHERE t.completada)::int AS completadas
     FROM generate_series(1, 5) AS p(prioridad)
     LEFT JOIN tareas t ON t.prioridad = p.prioridad AND t.usuario_id = $1
     GROUP BY p.prioridad
     ORDER BY p.prioridad`,
    [usuarioId],
  );

  return rows.flatMap((fila) =>
    esPrioridad(fila.prioridad)
      ? [
          {
            prioridad: fila.prioridad,
            total: Number(fila.total),
            completadas: Number(fila.completadas),
          },
        ]
      : [],
  );
}

export async function agruparPorCategoria(
  usuarioId: number,
  client: Queryable = pool,
): Promise<EstadisticaCategoria[]> {
  const { rows } = await client.query<FilaCategoria>(
    `SELECT
       t.categoria_id,
       c.nombre AS categoria_nombre,
       c.color AS categoria_color,
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE t.completada)::int AS completadas
     FROM tareas t
     LEFT JOIN categorias c ON c.id = t.categoria_id
     WHERE t.usuario_id = $1
     GROUP BY t.categoria_id, c.nombre, c.color
     ORDER BY total DESC, categoria_nombre NULLS LAST`,
    [usuarioId],
  );

  return rows.map((fila) => ({
    categoria_id: fila.categoria_id === null ? null : Number(fila.categoria_id),
    categoria_nombre: fila.categoria_nombre,
    categoria_color: fila.categoria_color,
    total: Number(fila.total),
    completadas: Number(fila.completadas),
  }));
}
