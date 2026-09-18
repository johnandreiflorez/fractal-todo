import { useTranslation } from 'react-i18next';
import { Badge } from '../../design-system/index.js';
import type { Tarea } from '../../tipos/index.js';
import estilos from './TarjetaArrastrada.module.css';

interface Props {
  tarea: Tarea;
  x: number;
  y: number;
}

export function TarjetaArrastrada({ tarea, x, y }: Props) {
  const { t } = useTranslation();

  return (
    <div
      data-fantasma="true"
      className={estilos.arrastrada}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
    >
      <div className="flex rotate-2 items-center gap-3 rounded-lg border border-primario bg-superficie px-4 py-3 shadow-media">
        <p className="max-w-64 truncate font-semibold text-texto">{tarea.titulo}</p>
        <Badge variante="neutro">{t(`prioridades.${tarea.prioridad}`)}</Badge>
      </div>
    </div>
  );
}
