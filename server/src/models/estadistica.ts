import type { Prioridad } from './tarea.js';

export interface ResumenEstadisticas {
  total: number;
  completadas: number;
  pendientes: number;
  vencidas: number;
  tasa_completado: number;
}

export interface EstadisticaPrioridad {
  prioridad: Prioridad;
  total: number;
  completadas: number;
}

export interface EstadisticaCategoria {
  categoria_id: number | null;
  categoria_nombre: string | null;
  categoria_color: string | null;
  total: number;
  completadas: number;
}

export interface EstadisticasTareas {
  resumen: ResumenEstadisticas;
  por_prioridad: EstadisticaPrioridad[];
  por_categoria: EstadisticaCategoria[];
}
