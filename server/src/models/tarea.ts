export const PRIORIDADES = [1, 2, 3, 4, 5] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const NOMBRE_PRIORIDADES: Record<Prioridad, string> = {
  1: 'Urgente',
  2: 'Alta',
  3: 'Media',
  4: 'Normal',
  5: 'Baja',
};

export interface Tarea {
  id: number;
  usuario_id: number;
  categoria_id: number | null;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  completada: boolean;
  fecha_vencimiento: string | null;
  completada_en: Date | null;
  creado_en: Date;
  actualizado_en: Date;
  etiquetas: string[];
  categoria_nombre: string | null;
  categoria_color: string | null;
}

export interface FilaTarea {
  id: number;
  usuario_id: number;
  categoria_id: number | null;
  titulo: string;
  descripcion: string | null;
  prioridad: number;
  completada: boolean;
  fecha_vencimiento: string | null;
  completada_en: Date | null;
  creado_en: Date;
  actualizado_en: Date;
  etiquetas: string[];
  categoria_nombre: string | null;
  categoria_color: string | null;
}

export function esPrioridad(value: unknown): value is Prioridad {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (PRIORIDADES as readonly number[]).includes(value)
  );
}

export interface FiltrosTareas {
  usuario_id: number;
  completada?: boolean;
  categoria_id?: number;
  prioridad?: Prioridad;
  desde?: string;
  hasta?: string;
  busqueda?: string;
  etiquetas?: string[];
  ordenar?: 'creado_en' | 'fecha_vencimiento' | 'prioridad' | 'titulo';
  direccion?: 'asc' | 'desc';
}

export interface NuevaTarea {
  usuario_id: number;
  titulo: string;
  descripcion?: string | null;
  prioridad?: Prioridad;
  categoria_id?: number | null;
  fecha_vencimiento?: string | null;
  etiquetas?: string[];
}

export interface ActualizarTarea {
  titulo?: string;
  descripcion?: string | null;
  prioridad?: Prioridad;
  categoria_id?: number | null;
  fecha_vencimiento?: string | null;
  etiquetas?: string[];
}

export interface CambiosLote {
  completada?: boolean;
  prioridad?: Prioridad;
  categoria_id?: number | null;
  etiquetas?: string[];
}