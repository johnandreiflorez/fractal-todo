import { useTranslation } from 'react-i18next';
import { useCategorias } from '../../hooks/useCategorias.js';
import { useEtiquetas } from '../../hooks/useEtiquetas.js';
import type { OpcionesFiltrosTareas } from '../../utils/helpers.js';
import styles from './FiltroTareas.module.css';

interface Props {
  valor: OpcionesFiltrosTareas;
  onChange: (valor: OpcionesFiltrosTareas) => void;
}

const PRIORIDADES = ['1', '2', '3', '4', '5'] as const;

export function FiltroTareas({ valor, onChange }: Props) {
  const { t } = useTranslation();
  const { data: categorias } = useCategorias();
  const { data: etiquetas } = useEtiquetas();

  const completada =
    valor.completada === undefined ? '' : String(valor.completada);

  const actualizar = (parcial: Partial<OpcionesFiltrosTareas>) =>
    onChange({ ...valor, ...parcial });

  const hayFiltros =
    Boolean(valor.busqueda) ||
    valor.completada !== undefined ||
    valor.categoria !== undefined ||
    valor.prioridad !== undefined ||
    Boolean(valor.desde) ||
    Boolean(valor.hasta) ||
    (valor.etiquetas?.length ?? 0) > 0;

  return (
    <div className={styles.filtros} role="search">
      <input
        className={styles.campo}
        type="search"
        placeholder={t('tarea.buscar')}
        value={valor.busqueda ?? ''}
        onChange={(evento) => actualizar({ busqueda: evento.target.value })}
        aria-label={t('tarea.buscarAria')}
      />

      <select
        className={styles.campo}
        value={completada}
        onChange={(evento) => {
          const valorEstado = evento.target.value;
          actualizar({
            completada:
              valorEstado === '' ? undefined : valorEstado === 'true',
          });
        }}
        aria-label={t('tarea.estadoAria')}
      >
        <option value="">{t('tarea.todas')}</option>
        <option value="false">{t('tarea.pendientes')}</option>
        <option value="true">{t('tarea.completadas')}</option>
      </select>

      <select
        className={styles.campo}
        value={valor.categoria ?? ''}
        onChange={(evento) => {
          const text = evento.target.value;
          actualizar({ categoria: text === '' ? undefined : Number(text) });
        }}
        aria-label={t('tarea.categoriaAria')}
      >
        <option value="">{t('tarea.todasCategorias')}</option>
        {categorias?.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>

      <select
        className={styles.campo}
        value={valor.prioridad ?? ''}
        onChange={(evento) => {
          const text = evento.target.value;
          actualizar({ prioridad: text === '' ? undefined : Number(text) });
        }}
        aria-label={t('tarea.prioridadAria')}
      >
        <option value="">{t('tarea.todaPrioridad')}</option>
        {PRIORIDADES.map((prioridad) => (
          <option key={prioridad} value={prioridad}>
            {t(`prioridades.${prioridad}`)}
          </option>
        ))}
      </select>

      <input
        className={styles.campo}
        type="date"
        value={valor.desde ?? ''}
        onChange={(evento) => actualizar({ desde: evento.target.value })}
        aria-label={t('tarea.desde')}
      />

      <input
        className={styles.campo}
        type="date"
        value={valor.hasta ?? ''}
        onChange={(evento) => actualizar({ hasta: evento.target.value })}
        aria-label={t('tarea.hasta')}
      />

      <select
        className={styles.campo}
        value={valor.etiquetas?.[0] ?? ''}
        onChange={(evento) => {
          const nombre = evento.target.value;
          actualizar({ etiquetas: nombre === '' ? [] : [nombre] });
        }}
        aria-label={t('tarea.etiquetaAria')}
      >
        <option value="">{t('tarea.cualquierEtiqueta')}</option>
        {etiquetas?.map((etiqueta) => (
          <option key={etiqueta.id} value={etiqueta.nombre}>
            {etiqueta.nombre}
          </option>
        ))}
      </select>

      <select
        className={styles.campo}
        value={valor.ordenar ?? 'creado_en'}
        onChange={(evento) =>
          actualizar({
            ordenar: evento.target.value as OpcionesFiltrosTareas['ordenar'],
          })
        }
        aria-label={t('tarea.ordenarPor')}
      >
        <option value="creado_en">{t('tarea.ordenarCreado')}</option>
        <option value="fecha_vencimiento">{t('tarea.ordenarVencimiento')}</option>
        <option value="prioridad">{t('tarea.ordenarPrioridad')}</option>
        <option value="titulo">{t('tarea.ordenarTitulo')}</option>
      </select>

      <select
        className={styles.campo}
        value={valor.direccion ?? 'desc'}
        onChange={(evento) =>
          actualizar({
            direccion: evento.target.value as OpcionesFiltrosTareas['direccion'],
          })
        }
        aria-label={t('tarea.direccionAria')}
      >
        <option value="desc">{t('tarea.descendente')}</option>
        <option value="asc">{t('tarea.ascendente')}</option>
      </select>

      {hayFiltros && (
        <button className={styles.limpiar} onClick={() => onChange({})}>
          {t('tarea.limpiar')}
        </button>
      )}
    </div>
  );
}