import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mensajeDeError } from '../../api/cliente.js';
import { useCompletarTarea, useEliminarTarea } from '../../hooks/useTareas.js';
import { COLORES_PRIORIDAD, formatearFecha } from '../../utils/helpers.js';
import type { Tarea } from '../../tipos/index.js';
import styles from './ItemTarea.module.css';

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
    <li className={`${styles.item} ${tarea.completada ? styles.completada : ''}`}>
      <input
        className={styles.seleccion}
        type="checkbox"
        checked={seleccionada}
        onChange={(evento) => onCambiarSeleccion(tarea.id, evento.target.checked)}
        aria-label={t('tarea.seleccionarAria', { titulo: tarea.titulo })}
      />

      <button
        className={styles.botonCompletar}
        onClick={() => void manejarCompletar()}
        aria-label={
          tarea.completada ? t('tarea.marcarPendiente') : t('tarea.marcarCompletada')
        }
        title={
          tarea.completada ? t('tarea.deshacerCompletado') : t('tarea.completar')
        }
      >
        {tarea.completada ? '✓' : '○'}
      </button>

      <div className={styles.cuerpo}>
        <div className={styles.tituloFila}>
          <span className={styles.titulo}>{tarea.titulo}</span>
          <span
            className={styles.insigniaPrioridad}
            style={{ backgroundColor: COLORES_PRIORIDAD[tarea.prioridad] ?? 'transparent' }}
          >
            {t(`prioridades.${tarea.prioridad}`)}
          </span>
        </div>

        {tarea.descripcion && <p className={styles.descripcion}>{tarea.descripcion}</p>}

        <div className={styles.meta}>
          {tarea.categoria_nombre && (
            <span
              className={styles.categoria}
              style={{
                color: tarea.categoria_color ?? undefined,
                borderColor: tarea.categoria_color ?? undefined,
              }}
            >
              #{tarea.categoria_nombre}
            </span>
          )}
          <span className={vencida ? styles.fechaVencida : styles.fecha}>
            {tarea.fecha_vencimiento
              ? formatearFecha(tarea.fecha_vencimiento)
              : t('tarea.sinFecha')}
          </span>
          {tarea.etiquetas.map((nombre) => (
            <span key={nombre} className={styles.etiqueta}>
              {nombre}
            </span>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.acciones}>
        <button className={styles.botonEditar} onClick={() => onEditar(tarea)}>
          {t('tarea.editar')}
        </button>
        <button className={styles.botonEliminar} onClick={() => void manejarEliminar()}>
          {t('tarea.eliminar')}
        </button>
      </div>
    </li>
  );
}