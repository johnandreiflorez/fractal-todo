import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { Button, EstadoVacio, IndicadorCarga, MensajeError } from '../../design-system/index.js';
import { useTareas } from '../../hooks/useTareas.js';
import type { Tarea } from '../../tipos/index.js';
import { aFiltrosTareas } from '../../utils/helpers.js';
import type { OpcionesFiltrosTareas } from '../../utils/helpers.js';
import { BarraAccionesLote } from './BarraAccionesLote.js';
import { FiltroTareas } from './FiltroTareas.js';
import { FormularioTarea } from './FormularioTarea.js';
import { ItemTarea } from './ItemTarea.js';

export function ListaTareas() {
  const { t } = useTranslation();
  const [filtros, setFiltros] = useState<OpcionesFiltrosTareas>({});
  const {
    data: tareas,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useTareas(aFiltrosTareas(filtros));

  const refrescando = isFetching && !isPending;

  const [seleccion, setSeleccion] = useState<ReadonlySet<number>>(new Set());
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);

  const idsVisibles = useMemo(() => tareas?.map((tarea) => tarea.id) ?? [], [tareas]);
  const todasSeleccionadas =
    idsVisibles.length > 0 && idsVisibles.every((id) => seleccion.has(id));

  const alternarSeleccion = (id: number, marcada: boolean) => {
    setSeleccion((previas) => {
      const siguientes = new Set(previas);
      if (marcada) siguientes.add(id);
      else siguientes.delete(id);
      return siguientes;
    });
  };

  const alternarSeleccionTodas = () => {
    setSeleccion(todasSeleccionadas ? new Set() : new Set(idsVisibles));
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-texto">
            {t('tarea.misTareas')}
          </h1>
          {refrescando && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-sm text-texto-atenuado"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('comunes.actualizando')}
            </span>
          )}
        </div>
        <Button
          variante="primario"
          icono={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={() => setCreando(true)}
        >
          {t('tarea.nuevaTarea')}
        </Button>
      </div>

      <FiltroTareas valor={filtros} onChange={setFiltros} />

      {seleccion.size > 0 && (
        <BarraAccionesLote
          ids={[...seleccion]}
          onListo={() => setSeleccion(new Set())}
        />
      )}

      {idsVisibles.length > 0 && (
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-texto-suave">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primario"
            checked={todasSeleccionadas}
            onChange={alternarSeleccionTodas}
          />
          {t('tarea.seleccionarVisibles')}
        </label>
      )}

      {isPending && <IndicadorCarga texto={t('comunes.cargandoTareas')} />}

      {isError && (
        <MensajeError
          mensaje={mensajeDeError(error)}
          textoReintentar={t('comunes.reintentar')}
          onReintentar={() => void refetch()}
        />
      )}

      {!isPending && !isError && (tareas?.length ?? 0) === 0 && (
        <EstadoVacio mensaje={t('tarea.vacio')} />
      )}

      {!isPending && !isError && (tareas?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-3">
          {tareas?.map((tarea) => (
            <ItemTarea
              key={tarea.id}
              tarea={tarea}
              seleccionada={seleccion.has(tarea.id)}
              onCambiarSeleccion={alternarSeleccion}
              onEditar={setEditando}
            />
          ))}
        </ul>
      )}

      {creando && <FormularioTarea abierto onCerrar={() => setCreando(false)} />}

      {editando && (
        <FormularioTarea
          abierto
          tarea={editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}