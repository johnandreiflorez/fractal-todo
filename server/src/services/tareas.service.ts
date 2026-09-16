import {
  actualizar as repoActualizar,
  actualizarLote as repoActualizarLote,
  cambiarCompletado,
  crear as repoCrear,
  eliminar,
  eliminarLote,
  listar,
  obtenerDetallada,
  pertenecenAlUsuario,
} from '../repositories/tarea.repo.js';
import { withTransaction } from '../config/db.js';
import { crearSiNoExisten, eliminarSiNoUsadas, reemplazarDeTarea } from '../repositories/etiqueta.repo.js';
import { perteneceAlUsuario as categoriaDelUsuario } from '../repositories/categoria.repo.js';
import { badRequest, noEncontrado } from '../utils/httpError.js';
import type {
  ActualizarTarea,
  CambiosLote,
  FilaTarea,
  FiltrosTareas,
  NuevaTarea,
} from '../models/tarea.js';
import { esPrioridad } from '../models/tarea.js';

export interface FiltrosQueryTareas {
  completada?: boolean;
  categoria?: number;
  prioridad?: number;
  fecha_vencimiento?: string;
  busqueda?: string;
  etiquetas?: string;
  ordenar?: FiltrosTareas['ordenar'];
  direccion?: FiltrosTareas['direccion'];
}

function parsearRangoFecha(valor?: string): { desde?: string; hasta?: string } {
  if (!valor) return {};
  const partes = valor
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length === 0) {
    throw badRequest('fecha_vencimiento inválida');
  }
  if (partes.length === 1) {
    const fecha = partes[0] ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw badRequest('fecha_vencimiento debe usar formato YYYY-MM-DD');
    }
    return { desde: fecha, hasta: fecha };
  }
  if (partes.length === 2) {
    const [desde, hasta] = partes as [string, string];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
      throw badRequest('fecha_vencimiento debe usar formato YYYY-MM-DD o YYYY-MM-DD,YYYY-MM-DD');
    }
    return { desde, hasta };
  }
  throw badRequest('fecha_vencimiento debe usar formato YYYY-MM-DD o YYYY-MM-DD,YYYY-MM-DD');
}

export async function listarTareas(
  usuarioId: number,
  query: FiltrosQueryTareas,
): Promise<FilaTarea[]> {
  const rango = parsearRangoFecha(query.fecha_vencimiento);
  const filtros: FiltrosTareas = {
    usuario_id: usuarioId,
    completada: query.completada,
    categoria_id: query.categoria,
    prioridad: esPrioridad(query.prioridad) ? query.prioridad : undefined,
    desde: rango.desde,
    hasta: rango.hasta,
    busqueda: query.busqueda,
    etiquetas: query.etiquetas
      ? query.etiquetas
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : undefined,
    ordenar: query.ordenar,
    direccion: query.direccion,
  };
  return listar(filtros);
}

async function validarCategoriaDelUsuario(
  categoriaId: number | null | undefined,
  usuarioId: number,
): Promise<void> {
  if (categoriaId === undefined || categoriaId === null) return;
  const pertenece = await categoriaDelUsuario(categoriaId, usuarioId);
  if (!pertenece) {
    throw badRequest('La categoría indicada no pertenece al usuario');
  }
}

export async function crearTarea(
  usuarioId: number,
  datos: NuevaTarea,
): Promise<FilaTarea> {
  await validarCategoriaDelUsuario(datos.categoria_id, usuarioId);
  return withTransaction(async (client) => {
    const etiquetas = datos.etiquetas?.length
      ? await crearSiNoExisten(usuarioId, datos.etiquetas, client)
      : [];
    const tarea = await repoCrear(
      {
        usuario_id: usuarioId,
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        prioridad: datos.prioridad,
        categoria_id: datos.categoria_id,
        fecha_vencimiento: datos.fecha_vencimiento,
      },
      etiquetas.map((e) => e.id),
      client,
    );
    const detallada = await obtenerDetallada(tarea.id, usuarioId, client);
    if (!detallada) throw noEncontrado('Tarea no encontrada');
    return detallada;
  });
}

export async function actualizarTarea(
  usuarioId: number,
  id: number,
  cambios: ActualizarTarea,
): Promise<FilaTarea> {
  await validarCategoriaDelUsuario(cambios.categoria_id, usuarioId);
  return withTransaction(async (client) => {
    const tarea = await repoActualizar(id, usuarioId, cambios, client);
    if (!tarea) throw noEncontrado('Tarea no encontrada');

    if (cambios.etiquetas !== undefined) {
      const etiquetas = await crearSiNoExisten(usuarioId, cambios.etiquetas, client);
      await reemplazarDeTarea(id, etiquetas.map((e) => e.id), client);
      await eliminarSiNoUsadas(usuarioId, client);
    }

    const detallada = await obtenerDetallada(id, usuarioId, client);
    if (!detallada) throw noEncontrado('Tarea no encontrada');
    return detallada;
  });
}

export async function completarTarea(
  usuarioId: number,
  id: number,
  completada: boolean,
): Promise<FilaTarea> {
  const tarea = await cambiarCompletado(id, usuarioId, completada);
  if (!tarea) throw noEncontrado('Tarea no encontrada');
  const detallada = await obtenerDetallada(id, usuarioId);
  if (!detallada) throw noEncontrado('Tarea no encontrada');
  return detallada;
}

export async function eliminarTarea(usuarioId: number, id: number): Promise<void> {
  const eliminada = await eliminar(id, usuarioId);
  if (!eliminada) throw noEncontrado('Tarea no encontrada');
}

export interface ResultadoLote {
  afectadas: number;
  omitidas: number;
}

export async function actualizarTareasEnLote(
  usuarioId: number,
  ids: number[],
  cambios: CambiosLote,
): Promise<ResultadoLote> {
  await validarCategoriaDelUsuario(cambios.categoria_id, usuarioId);
  return withTransaction(async (client) => {
    const pertenecientes = await pertenecenAlUsuario(ids, usuarioId, client);
    if (pertenecientes.length === 0) {
      throw noEncontrado('Ninguna tarea encontrada');
    }
    const omitidas = ids.filter((i) => !pertenecientes.includes(i)).length;

    const afectadas = await repoActualizarLote(
      pertenecientes,
      usuarioId,
      cambios,
      client,
    );

    if (cambios.etiquetas !== undefined) {
      const etiquetas = await crearSiNoExisten(usuarioId, cambios.etiquetas, client);
      const etiquetaIds = etiquetas.map((e) => e.id);
      for (const id of pertenecientes) {
        await reemplazarDeTarea(id, etiquetaIds, client);
      }
      await eliminarSiNoUsadas(usuarioId, client);
    }

    return { afectadas, omitidas };
  });
}

export async function eliminarTareasEnLote(
  usuarioId: number,
  ids: number[],
): Promise<ResultadoLote> {
  return withTransaction(async (client) => {
    const pertenecientes = await pertenecenAlUsuario(ids, usuarioId, client);
    if (pertenecientes.length === 0) {
      throw noEncontrado('Ninguna tarea encontrada');
    }
    const omitidas = ids.filter((i) => !pertenecientes.includes(i)).length;
    const afectadas = await eliminarLote(pertenecientes, usuarioId, client);
    await eliminarSiNoUsadas(usuarioId, client);
    return { afectadas, omitidas };
  });
}