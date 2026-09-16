import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { Badge, BotonIcono, Button } from '../../design-system/index.js';
import { useCompletarTarea, useEliminarTarea } from '../../hooks/useTareas.js';
import { COLORES_PRIORIDAD, formatearFecha } from '../../utils/helpers.js';
import type { Tarea } from '../../tipos/index.js';

interface Props {
  tarea: Tarea;
  seleccionada: boolean;
  onCambiarSeleccion: (id: number, seleccionada: boolean) => void;
  onEditar: (tarea: Tarea) => void;
}

function hoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function ItemTarea({ tarea, seleccionada, onCambiarSeleccion, onEditar }: Props) {
  const { t } = useTranslation();
  const completar = useCompletarTarea();
  const eliminar = useEliminarTarea();
  const [error, setError] = useState<string | null>(null);

  const vencida =
    !tarea.completada &&
    tarea.fecha_vencimiento !== null &&
    tarea.fecha_vencimiento < hoyISO();

  const manejarCompletar = async () => {
    try {
      setError(null);
      await completar.mutateAsync({ id: tarea.id, completada: !tarea.completada });
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  const manejarEliminar = async () => {
    if (!window.confirm(t('tarea.eliminarConfirmUno', { titulo: tarea.titulo }))) return;
    try {
      setError(null);
      await eliminar.mutateAsync(tarea.id);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <li
      className={
        tarea.completada
          ? 'flex items-start gap-3 rounded-lg border border-borde bg-superficie p-4 shadow-baja opacity-60 transition-all duration-200'
          : 'flex animate-rise-in items-start gap-3 rounded-lg border border-borde bg-superficie p-4 shadow-baja transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-media'
      }
    >
      <input
        type="checkbox"
        className="mt-1.5 h-4 w-4 shrink-0 accent-primario"
        checked={seleccionada}
        onChange={(evento) => onCambiarSeleccion(tarea.id, evento.target.checked)}
        aria-label={t('tarea.seleccionarAria', { titulo: tarea.titulo })}
      />

      <BotonIcono
        etiqueta={
          tarea.completada ? t('tarea.marcarPendiente') : t('tarea.marcarCompletada')
        }
        onClick={() => void manejarCompletar()}
      >
        {tarea.completada ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Circle className="h-5 w-5" aria-hidden="true" />
        )}
      </BotonIcono>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              tarea.completada
                ? 'titulo-tarea min-w-0 flex-1 truncate font-semibold text-texto line-through'
                : 'titulo-tarea min-w-0 flex-1 truncate font-semibold text-texto'
            }
          >
            {tarea.titulo}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: COLORES_PRIORIDAD[tarea.prioridad] ?? 'transparent' }}
          >
            {t(`prioridades.${tarea.prioridad}`)}
          </span>
        </div>

        {tarea.descripcion && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-texto-suave">
            {tarea.descripcion}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {tarea.categoria_nombre && (
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              style={{
                color: tarea.categoria_color ?? undefined,
                borderColor: tarea.categoria_color ?? undefined,
              }}
            >
              #{tarea.categoria_nombre}
            </span>
          )}
          <span className={vencida ? 'text-peligro-fuerte' : 'text-texto-atenuado'}>
            {tarea.fecha_vencimiento
              ? formatearFecha(tarea.fecha_vencimiento)
              : t('tarea.sinFecha')}
          </span>
          {tarea.etiquetas.map((nombre) => (
            <Badge key={nombre} variante="neutro">
              {nombre}
            </Badge>
          ))}
        </div>

        {error && <p className="mt-2 text-sm text-peligro-fuerte">{error}</p>}
      </div>

      <div className="flex shrink-0 gap-1.5">
        <Button tamano="sm" icono={<Pencil className="h-4 w-4" aria-hidden="true" />} onClick={() => onEditar(tarea)}>
          {t('tarea.editar')}
        </Button>
        <Button
          tamano="sm"
          variante="peligro"
          icono={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          onClick={() => void manejarEliminar()}
        >
          {t('tarea.eliminar')}
        </Button>
      </div>
    </li>
  );
}