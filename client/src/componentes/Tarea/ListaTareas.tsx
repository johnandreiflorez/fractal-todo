import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mensajeDeError } from '../../api/cliente.js';
import { useTareas } from '../../hooks/useTareas.js';
import type { Tarea } from '../../tipos/index.js';
import { aFiltrosTareas } from '../../utils/helpers.js';
import type { OpcionesFiltrosTareas } from '../../utils/helpers.js';
import { Cargando } from '../Comunes/Cargando.js';
import { MensajeError } from '../Comunes/MensajeError.js';
import { BarraAccionesLote } from './BarraAccionesLote.js';
import { FiltroTareas } from './FiltroTareas.js';
import { FormularioTarea } from './FormularioTarea.js';
import { ItemTarea } from './ItemTarea.js';
import styles from './ListaTareas.module.css';

export function ListaTareas() {
  const { t } = useTranslation();
  const [filtros, setFiltros] = useState<OpcionesFiltrosTareas>({});
  const {
    data: tareas,
    isPending,
    isError,
    error,
    refetch,
  } = useTareas(aFiltrosTareas(filtros));

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
    <section className={styles.panel}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>{t('tarea.misTareas')}</h1>
        <button className={styles.botonNueva} onClick={() => setCreando(true)}>
          {t('tarea.nuevaTarea')}
        </button>
      </div>

      <FiltroTareas valor={filtros} onChange={setFiltros} />

      {seleccion.size > 0 && (
        <BarraAccionesLote
          ids={[...seleccion]}
          onListo={() => setSeleccion(new Set())}
        />
      )}

      {idsVisibles.length > 0 && (
        <label className={styles.seleccionTodas}>
          <input
            type="checkbox"
            checked={todasSeleccionadas}
            onChange={alternarSeleccionTodas}
          />
          {t('tarea.seleccionarVisibles')}
        </label>
      )}

      {isPending && <Cargando texto={t('comunes.cargandoTareas')} />}

      {isError && (
        <MensajeError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {!isPending && !isError && (tareas?.length ?? 0) === 0 && (
        <p className={styles.vacio}>{t('tarea.vacio')}</p>
      )}

      {!isPending && !isError && (tareas?.length ?? 0) > 0 && (
        <ul className={styles.lista}>
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