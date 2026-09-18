export interface UsuarioLogueado {
  id: number;
  nombre: string;
  email: string;
}

export interface Sesion {
  token: string;
  usuario: UsuarioLogueado;
}

export interface Categoria {
  id: number;
  usuario_id: number;
  nombre: string;
  color: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Etiqueta {
  id: number;
  usuario_id: number;
  nombre: string;
  creado_en: string;
}

export type Prioridad = 1 | 2 | 3 | 4 | 5;

export interface Tarea {
  id: number;
  usuario_id: number;
  categoria_id: number | null;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  completada: boolean;
  fecha_vencimiento: string | null;
  completada_en: string | null;
  creado_en: string;
  actualizado_en: string;
  etiquetas: string[];
  categoria_nombre: string | null;
  categoria_color: string | null;
}

export interface FiltrosTareas {
  completada?: boolean;
  categoria?: number;
  prioridad?: number;
  fecha_vencimiento?: string;
  busqueda?: string;
  etiquetas?: string;
  ordenar?: 'creado_en' | 'fecha_vencimiento' | 'prioridad' | 'titulo';
  direccion?: 'asc' | 'desc';
}

export interface NuevaTarea {
  titulo: string;
  descripcion?: string | null;
  prioridad?: number;
  categoria_id?: number | null;
  fecha_vencimiento?: string | null;
  etiquetas?: string[];
}

export interface CambiosLote {
  completada?: boolean;
  prioridad?: number;
  categoria_id?: number | null;
  etiquetas?: string[];
}

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

export type RecursoTiempoReal = 'tareas' | 'categorias' | 'etiquetas' | 'estadisticas';

export interface MensajeCambioTiempoReal {
  tipo: 'cambio';
  recursos: RecursoTiempoReal[];
  emitido_en: string;
}

function esRecursoTiempoReal(valor: unknown): valor is RecursoTiempoReal {
  return (
    valor === 'tareas' ||
    valor === 'categorias' ||
    valor === 'etiquetas' ||
    valor === 'estadisticas'
  );
}

export function esMensajeCambio(valor: unknown): valor is MensajeCambioTiempoReal {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'tipo' in valor &&
    valor.tipo === 'cambio' &&
    'recursos' in valor &&
    Array.isArray(valor.recursos) &&
    valor.recursos.every(esRecursoTiempoReal)
  );
}

export function esUsuarioLogueado(valor: unknown): valor is UsuarioLogueado {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    'email' in valor &&
    'nombre' in valor
  );
}

export function esSesion(valor: unknown): valor is Sesion {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'token' in valor &&
    typeof (valor as { token?: unknown }).token === 'string' &&
    esUsuarioLogueado((valor as { usuario?: unknown }).usuario)
  );
}

export function esTarea(valor: unknown): valor is Tarea {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    'titulo' in valor &&
    'completada' in valor &&
    Array.isArray((valor as { etiquetas?: unknown }).etiquetas)
  );
}

export function esCategoria(valor: unknown): valor is Categoria {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    'nombre' in valor &&
    'usuario_id' in valor
  );
}

export function esEtiqueta(valor: unknown): valor is Etiqueta {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    'nombre' in valor &&
    'usuario_id' in valor
  );
}

function esResumenEstadisticas(valor: unknown): valor is ResumenEstadisticas {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'total' in valor &&
    'completadas' in valor &&
    'pendientes' in valor &&
    'vencidas' in valor &&
    'tasa_completado' in valor
  );
}

function esEstadisticaPrioridad(valor: unknown): valor is EstadisticaPrioridad {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'prioridad' in valor &&
    'total' in valor &&
    'completadas' in valor
  );
}

function esEstadisticaCategoria(valor: unknown): valor is EstadisticaCategoria {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'categoria_id' in valor &&
    'total' in valor &&
    'completadas' in valor
  );
}

export function esEstadisticasTareas(valor: unknown): valor is EstadisticasTareas {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'resumen' in valor &&
    esResumenEstadisticas(valor.resumen) &&
    'por_prioridad' in valor &&
    Array.isArray(valor.por_prioridad) &&
    valor.por_prioridad.every(esEstadisticaPrioridad) &&
    'por_categoria' in valor &&
    Array.isArray(valor.por_categoria) &&
    valor.por_categoria.every(esEstadisticaCategoria)
  );
}