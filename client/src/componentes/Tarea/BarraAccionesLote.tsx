import { useTranslation } from 'react-i18next';
import { Button, Selector, Tecla } from '../../design-system/index.js';
import { useCategorias } from '../../hooks/useCategorias.js';

interface Props {
  ids: number[];
  ocupado: boolean;
  cargandoCompletar: boolean;
  cargandoReabrir: boolean;
  cargandoEliminar: boolean;
  error: string | null;
  onCompletar: () => void;
  onReabrir: () => void;
  onAsignarPrioridad: (prioridad: number) => void;
  onMoverCategoria: (categoriaId: number | null) => void;
  onEliminar: () => void;
}

const PRIORIDADES = ['1', '2', '3', '4', '5'] as const;

export function BarraAccionesLote({
  ids,
  ocupado,
  cargandoCompletar,
  cargandoReabrir,
  cargandoEliminar,
  error,
  onCompletar,
  onReabrir,
  onAsignarPrioridad,
  onMoverCategoria,
  onEliminar,
}: Props) {
  const { t } = useTranslation();
  const { data: categorias } = useCategorias();

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-borde bg-superficie p-3 shadow-baja"
      role="group"
      aria-label={t('tarea.accionesLoteAria')}
    >
      <span className="mr-2 text-sm font-medium text-texto">
        {t('tarea.seleccionadas', { count: ids.length })}
      </span>

      <Button
        tamano="sm"
        disabled={ocupado}
        cargando={cargandoCompletar}
        aria-keyshortcuts="X"
        onClick={onCompletar}
      >
        {t('tarea.completar')} <Tecla>X</Tecla>
      </Button>

      <Button
        tamano="sm"
        variante="secundario"
        disabled={ocupado}
        cargando={cargandoReabrir}
        aria-keyshortcuts="Shift+X"
        onClick={onReabrir}
      >
        {t('tarea.reabrir')} <Tecla>⇧X</Tecla>
      </Button>

      <Selector
        className="w-40"
        disabled={ocupado}
        defaultValue=""
        aria-label={t('tarea.prioridadLoteAria')}
        onChange={(evento) => {
          const prioridad = Number(evento.target.value);
          if (prioridad >= 1 && prioridad <= 5) onAsignarPrioridad(prioridad);
        }}
      >
        <option value="" disabled>
          {t('tarea.asignarPrioridad')}
        </option>
        {PRIORIDADES.map((prioridad) => (
          <option key={prioridad} value={prioridad}>
            {t(`prioridades.${prioridad}`)}
          </option>
        ))}
      </Selector>

      <Selector
        className="w-44"
        disabled={ocupado}
        defaultValue=""
        aria-label={t('tarea.categoriaLoteAria')}
        onChange={(evento) => {
          const texto = evento.target.value;
          if (texto === '') return;
          onMoverCategoria(texto === 'null' ? null : Number(texto));
        }}
      >
        <option value="" disabled>
          {t('tarea.moverCategoria')}
        </option>
        <option value="null">{t('tarea.sinCategoria')}</option>
        {categorias?.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </Selector>

      <Button
        tamano="sm"
        variante="peligro"
        disabled={ocupado}
        cargando={cargandoEliminar}
        aria-keyshortcuts="Delete"
        onClick={onEliminar}
      >
        {t('tarea.eliminar')} <Tecla>Del</Tecla>
      </Button>

      {error && <span className="w-full text-sm text-peligro-fuerte">{error}</span>}
    </div>
  );
}
