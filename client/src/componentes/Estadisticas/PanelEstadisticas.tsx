import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, ChevronDown } from 'lucide-react';
import { cx, IndicadorCarga, MensajeError } from '../../design-system/index.js';
import { useEstadisticas } from '../../hooks/useEstadisticas.js';
import type {
  EstadisticaCategoria,
  EstadisticaPrioridad,
  Prioridad,
} from '../../tipos/index.js';
import estilos from './PanelEstadisticas.module.css';

const CLASE_PRIORIDAD: Record<Prioridad, string> = {
  1: estilos.p1,
  2: estilos.p2,
  3: estilos.p3,
  4: estilos.p4,
  5: estilos.p5,
};

function porcentaje(completadas: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completadas / total) * 100);
}

function Barra({ valor, clase, color }: { valor: number; clase?: string; color?: string }) {
  const ancho = Math.max(0, Math.min(100, valor));
  return (
    <div className={estilos.barra}>
      <div
        className={cx(estilos.relleno, clase)}
        style={{ width: `${ancho}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  );
}

function Tarjeta({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-lg bg-superficie-2 px-3 py-2">
      <dt className="text-xs text-texto-suave">{etiqueta}</dt>
      <dd className="font-display text-xl font-semibold text-texto">{valor}</dd>
    </div>
  );
}

function FilaPrioridad({ fila }: { fila: EstadisticaPrioridad }) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-texto">{t(`prioridades.${fila.prioridad}`)}</span>
        <span className="text-texto-suave">
          {t('estadisticas.conteo', { completadas: fila.completadas, total: fila.total })}
        </span>
      </div>
      <Barra
        valor={porcentaje(fila.completadas, fila.total)}
        clase={cx(estilos.rellenoPrioridad, CLASE_PRIORIDAD[fila.prioridad])}
      />
    </li>
  );
}

function FilaCategoria({ fila }: { fila: EstadisticaCategoria }) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-2 text-texto">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: fila.categoria_color ?? 'rgb(var(--primario))' }}
            aria-hidden="true"
          />
          <span className="truncate">
            {fila.categoria_nombre ?? t('estadisticas.sinCategoria')}
          </span>
        </span>
        <span className="text-texto-suave">
          {t('estadisticas.conteo', { completadas: fila.completadas, total: fila.total })}
        </span>
      </div>
      <Barra
        valor={porcentaje(fila.completadas, fila.total)}
        color={fila.categoria_color ?? undefined}
      />
    </li>
  );
}

export function PanelEstadisticas() {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useEstadisticas();
  const [abierto, setAbierto] = useState(false);
  const idContenido = useId();

  return (
    <section className="rounded-xl border border-borde bg-superficie p-4 shadow-baja transition-all duration-200 hover:shadow-media">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-expanded={abierto}
        aria-controls={idContenido}
        aria-label={t('estadisticas.expandirAria')}
        className="flex w-full cursor-pointer items-center justify-between gap-2 md:pointer-events-none"
      >
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primario" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-texto">
            {t('estadisticas.titulo')}
          </h2>
        </span>
        <ChevronDown
          className={cx(
            'h-4 w-4 text-texto-suave transition-transform md:hidden',
            abierto && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div id={idContenido} className={cx('mt-4', abierto ? 'block' : 'hidden', 'md:block')}>
        {isPending && <IndicadorCarga texto={t('comunes.cargando')} />}

        {isError && (
          <MensajeError
            mensaje={t('estadisticas.error')}
            onReintentar={() => void refetch()}
            textoReintentar={t('comunes.reintentar')}
          />
        )}

        {data && data.resumen.total === 0 && (
          <p className="py-4 text-center text-sm text-texto-suave">{t('estadisticas.vacio')}</p>
        )}

        {data && data.resumen.total > 0 && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-2">
              <Tarjeta etiqueta={t('estadisticas.total')} valor={data.resumen.total} />
              <Tarjeta etiqueta={t('estadisticas.completadas')} valor={data.resumen.completadas} />
              <Tarjeta etiqueta={t('estadisticas.pendientes')} valor={data.resumen.pendientes} />
              <Tarjeta etiqueta={t('estadisticas.vencidas')} valor={data.resumen.vencidas} />
            </dl>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-texto-suave">{t('estadisticas.tasaCompletado')}</span>
                <span className="font-medium text-texto">
                  {t('estadisticas.porcentaje', { valor: data.resumen.tasa_completado })}
                </span>
              </div>
              <Barra valor={data.resumen.tasa_completado} />
            </div>

            <div>
              <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-texto-suave">
                {t('estadisticas.porPrioridad')}
              </h3>
              <ul className="flex flex-col gap-2">
                {data.por_prioridad.map((fila) => (
                  <FilaPrioridad key={fila.prioridad} fila={fila} />
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-texto-suave">
                {t('estadisticas.porCategoria')}
              </h3>
              <ul className="flex flex-col gap-2">
                {data.por_categoria.map((fila) => (
                  <FilaCategoria key={fila.categoria_id ?? 'sin-categoria'} fila={fila} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
