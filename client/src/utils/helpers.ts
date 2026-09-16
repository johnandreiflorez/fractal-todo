import type { FiltrosTareas } from '../tipos/index.js';

export const COLORES_PRIORIDAD: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#3b82f6',
  5: '#22c55e',
};

export function formatearFecha(valor: string | null): string {
  if (!valor) return 'Sin fecha';
  const [anio, mes, dia] = valor.split('T')[0]!.split('-');
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}

export interface OpcionesFiltrosTareas {
  completada?: boolean;
  categoria?: number;
  prioridad?: number;
  desde?: string;
  hasta?: string;
  busqueda?: string;
  etiquetas?: string[];
  ordenar?: 'creado_en' | 'fecha_vencimiento' | 'prioridad' | 'titulo';
  direccion?: 'asc' | 'desc';
}

export function aFiltrosTareas(opciones: OpcionesFiltrosTareas): FiltrosTareas {
  const filtros: FiltrosTareas = {};
  if (opciones.completada !== undefined) filtros.completada = opciones.completada;
  if (opciones.categoria !== undefined) filtros.categoria = opciones.categoria;
  if (opciones.prioridad !== undefined) filtros.prioridad = opciones.prioridad;

  const desde = opciones.desde?.trim();
  const hasta = opciones.hasta?.trim();
  if (desde && hasta) filtros.fecha_vencimiento = `${desde},${hasta}`;
  else if (desde) filtros.fecha_vencimiento = desde;
  else if (hasta) filtros.fecha_vencimiento = hasta;

  if (opciones.busqueda?.trim()) filtros.busqueda = opciones.busqueda.trim();
  if (opciones.etiquetas && opciones.etiquetas.length > 0) {
    filtros.etiquetas = opciones.etiquetas.join(',');
  }
  if (opciones.ordenar) filtros.ordenar = opciones.ordenar;
  if (opciones.direccion) filtros.direccion = opciones.direccion;
  return filtros;
}