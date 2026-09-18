import { memo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { Badge, BotonIcono, Button, cx } from '../../design-system/index.js';
import { useCompletarTarea, useEliminarTarea } from '../../hooks/useTareas.js';
import { COLORES_PRIORIDAD, formatearFecha } from '../../utils/helpers.js';
import type { Prioridad, Tarea } from '../../tipos/index.js';
import estilos from './ItemTarea.module.css';

const ACENTO_POR_PRIORIDAD: Record<Prioridad, string> = {
  1: estilos.p1,
  2: estilos.p2,
  3: estilos.p3,
  4: estilos.p4,
  5: estilos.p5,
};

interface Props {
  tarea: Tarea;
  seleccionada: boolean;
  onCambiarSeleccion: (id: number, seleccionada: boolean) => void;
  onEditar: (tarea: Tarea) => void;
  onArrastrar: (tarea: Tarea, x: number, y: number) => void;
  onSoltar: (tarea: Tarea, x: number, y: number) => void;
  onCancelarArrastre: () => void;
}

const UMBRAL_ARRASTRE_PX = 6;

function hoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function ItemTareaBase({
  tarea,
  seleccionada,
  onCambiarSeleccion,
  onEditar,
  onArrastrar,
  onSoltar,
  onCancelarArrastre,
}: Props) {
  const { t } = useTranslation();
  const completar = useCompletarTarea();
  const eliminar = useEliminarTarea();
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const arrastrandoRef = useRef(false);

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

  const esControl = (objetivo: EventTarget | null): boolean =>
    objetivo instanceof Element &&
    objetivo.closest('input, button, a, select, textarea, label') !== null;

  const manejarPointerDown = (evento: PointerEvent<HTMLLIElement>) => {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    if (esControl(evento.target)) return;
    inicio.current = { x: evento.clientX, y: evento.clientY };
    arrastrandoRef.current = false;
    evento.currentTarget.setPointerCapture(evento.pointerId);
  };

  const manejarPointerMove = (evento: PointerEvent<HTMLLIElement>) => {
    const puntoInicial = inicio.current;
    if (!puntoInicial) return;
    if (!arrastrandoRef.current) {
      const distancia = Math.hypot(
        evento.clientX - puntoInicial.x,
        evento.clientY - puntoInicial.y,
      );
      if (distancia < UMBRAL_ARRASTRE_PX) return;
      arrastrandoRef.current = true;
      setArrastrando(true);
    }
    onArrastrar(tarea, evento.clientX, evento.clientY);
  };

  const manejarPointerUp = (evento: PointerEvent<HTMLLIElement>) => {
    const estabaArrastrando = arrastrandoRef.current;
    inicio.current = null;
    arrastrandoRef.current = false;
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    if (!estabaArrastrando) return;
    setArrastrando(false);
    onSoltar(tarea, evento.clientX, evento.clientY);
  };

  const manejarPointerCancel = (evento: PointerEvent<HTMLLIElement>) => {
    inicio.current = null;
    arrastrandoRef.current = false;
    setArrastrando(false);
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    onCancelarArrastre();
  };

  return (
    <li
      onPointerDown={manejarPointerDown}
      onPointerMove={manejarPointerMove}
      onPointerUp={manejarPointerUp}
      onPointerCancel={manejarPointerCancel}
      className={cx(
        estilos.item,
        ACENTO_POR_PRIORIDAD[tarea.prioridad],
        'cursor-grab select-none active:cursor-grabbing',
        arrastrando && 'cursor-grabbing opacity-50',
        tarea.completada
          ? 'flex flex-col gap-3 rounded-lg border border-borde bg-superficie p-4 shadow-baja opacity-60 transition-all duration-200 sm:flex-row sm:items-start'
          : 'flex animate-rise-in flex-col gap-3 rounded-lg border border-borde bg-superficie p-4 shadow-baja transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-media sm:flex-row sm:items-start',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="hidden shrink-0 text-texto-atenuado sm:flex"
          aria-hidden="true"
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 accent-primario"
          checked={seleccionada}
          onChange={(evento) => onCambiarSeleccion(tarea.id, evento.target.checked)}
          aria-label={t('tarea.seleccionarAria', { titulo: tarea.titulo })}
        />
        <div className="flex items-center gap-1.5">
          <BotonIcono
            etiqueta={tarea.completada ? t('tarea.marcarPendiente') : t('tarea.marcarCompletada')}
            cargando={completar.isPending}
            onClick={() => void manejarCompletar()}
          >
            {tarea.completada ? (
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Circle className="h-5 w-5" aria-hidden="true" />
            )}
          </BotonIcono>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-3">
          <h3
            className={
              tarea.completada
                ? 'min-w-0 flex-1 truncate font-semibold text-texto line-through'
                : 'min-w-0 flex-1 truncate font-semibold text-texto'
            }
          >
            {tarea.titulo}
          </h3>
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
          cargando={eliminar.isPending}
          onClick={() => void manejarEliminar()}
        >
          {t('tarea.eliminar')}
        </Button>
      </div>
    </li>
  );
}

export const ItemTarea = memo(ItemTareaBase);