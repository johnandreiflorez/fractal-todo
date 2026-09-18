import type { Tarea } from '../tipos/index.js';

type ValorCelda = string | number | boolean | null;

const COLUMNAS_CSV = [
  'id',
  'titulo',
  'descripcion',
  'prioridad',
  'completada',
  'fecha_vencimiento',
  'completada_en',
  'categoria',
  'etiquetas',
  'creado_en',
  'actualizado_en',
] as const;

function neutralizarFormula(valor: string): string {
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

function celdaCsv(valor: ValorCelda): string {
  if (valor === null) return '';
  const texto = typeof valor === 'string' ? neutralizarFormula(valor) : String(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function filaCsv(tarea: Tarea): string {
  const valores: ValorCelda[] = [
    tarea.id,
    tarea.titulo,
    tarea.descripcion,
    tarea.prioridad,
    tarea.completada,
    tarea.fecha_vencimiento,
    tarea.completada_en,
    tarea.categoria_nombre,
    tarea.etiquetas.join('|'),
    tarea.creado_en,
    tarea.actualizado_en,
  ];
  return valores.map(celdaCsv).join(',');
}

export function tareasACSV(tareas: Tarea[]): string {
  return [COLUMNAS_CSV.join(','), ...tareas.map(filaCsv)].join('\r\n');
}

export function tareasAJSON(tareas: Tarea[]): string {
  return JSON.stringify(tareas, null, 2);
}

export function nombreExportacion(extension: 'csv' | 'json'): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `tareas-${ahora.getFullYear()}-${mes}-${dia}.${extension}`;
}

export function descargarTexto(
  nombreArchivo: string,
  contenido: string,
  tipoMime: string,
): void {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
