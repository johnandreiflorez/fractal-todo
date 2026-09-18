import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { cx } from '../../design-system/index.js';
import type { Tarea } from '../../tipos/index.js';
import type { ZonaArrastre } from '../../utils/arrastre.js';

interface Props {
  tarea: Tarea | null;
  zonaActiva: ZonaArrastre | null;
}

export function ZonasArrastre({ tarea, zonaActiva }: Props) {
  const { t } = useTranslation();

  if (!tarea) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <div className="absolute inset-0 bg-fondo/70" />

      <div
        data-zona="eliminar"
        className={cx(
          'absolute inset-y-0 left-0 flex w-1/3 max-w-xs flex-col items-center justify-center gap-2 border-r-2 border-dashed transition-colors',
          zonaActiva === 'izquierda'
            ? 'border-peligro bg-peligro-suave'
            : 'border-borde-fuerte bg-superficie',
        )}
      >
        <Trash2 className="h-6 w-6 text-peligro" aria-hidden="true" />
        <p className="px-4 text-center text-sm font-semibold text-peligro-fuerte">
          {t('tarea.soltarEliminar')}
        </p>
      </div>

      <div
        data-zona="estado"
        className={cx(
          'absolute inset-y-0 right-0 flex w-1/3 max-w-xs flex-col items-center justify-center gap-2 border-l-2 border-dashed transition-colors',
          zonaActiva === 'derecha'
            ? 'border-primario bg-primario-suave'
            : 'border-borde-fuerte bg-superficie',
        )}
      >
        {tarea.completada ? (
          <RotateCcw className="h-6 w-6 text-primario" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-6 w-6 text-primario" aria-hidden="true" />
        )}
        <p className="px-4 text-center text-sm font-semibold text-primario">
          {tarea.completada ? t('tarea.soltarReabrir') : t('tarea.soltarCompletar')}
        </p>
      </div>
    </div>
  );
}
