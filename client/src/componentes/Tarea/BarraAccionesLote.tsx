import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mensajeDeError } from '../../api/cliente.js';
import { useCategorias } from '../../hooks/useCategorias.js';
import {
  useActualizarTareasEnLote,
  useEliminarTareasEnLote,
} from '../../hooks/useTareas.js';
import styles from './BarraAccionesLote.module.css';

interface Props {
  ids: number[];
  onListo: () => void;
}

const PRIORIDADES = ['1', '2', '3', '4', '5'] as const;

export function BarraAccionesLote({ ids, onListo }: Props) {
  const { t } = useTranslation();
  const actualizarEnLote = useActualizarTareasEnLote();
  const eliminarEnLote = useEliminarTareasEnLote();
  const { data: categorias } = useCategorias();
  const [error, setError] = useState<string | null>(null);

  const ocupado = actualizarEnLote.isPending || eliminarEnLote.isPending;

  const ejecutar = async (accion: () => Promise<unknown>) => {
    try {
      setError(null);
      await accion();
      onListo();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <div className={styles.barra} role="group" aria-label={t('tarea.accionesLoteAria')}>
      <span className={styles.resumen}>
        {t('tarea.seleccionadas', { count: ids.length })}
      </span>

      <button
        className={styles.boton}
        disabled={ocupado}
        onClick={() =>
          void ejecutar(() =>
            actualizarEnLote.mutateAsync({ ids, cambios: { completada: true } }),
          )
        }
      >
        {t('tarea.completar')}
      </button>

      <button
        className={styles.boton}
        disabled={ocupado}
        onClick={() =>
          void ejecutar(() =>
            actualizarEnLote.mutateAsync({ ids, cambios: { completada: false } }),
          )
        }
      >
        {t('tarea.reabrir')}
      </button>

      <select
        className={styles.campo}
        disabled={ocupado}
        defaultValue=""
        aria-label={t('tarea.prioridadLoteAria')}
        onChange={(evento) => {
          const prioridad = Number(evento.target.value);
          if (prioridad >= 1 && prioridad <= 5) {
            void ejecutar(() =>
              actualizarEnLote.mutateAsync({ ids, cambios: { prioridad } }),
            );
          }
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
      </select>

      <select
        className={styles.campo}
        disabled={ocupado}
        defaultValue=""
        aria-label={t('tarea.categoriaLoteAria')}
        onChange={(evento) => {
          const texto = evento.target.value;
          if (texto === '') return;
          void ejecutar(() =>
            actualizarEnLote.mutateAsync({
              ids,
              cambios: { categoria_id: texto === 'null' ? null : Number(texto) },
            }),
          );
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
      </select>

      <button
        className={styles.peligro}
        disabled={ocupado}
        onClick={() => {
          if (window.confirm(t('tarea.eliminarConfirmLote', { count: ids.length }))) {
            void ejecutar(() => eliminarEnLote.mutateAsync(ids));
          }
        }}
      >
        {t('tarea.eliminar')}
      </button>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}