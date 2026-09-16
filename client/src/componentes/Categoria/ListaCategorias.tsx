import { useTranslation } from 'react-i18next';
import type { Categoria } from '../../tipos/index.js';
import styles from './ListaCategorias.module.css';

interface Props {
  categorias: Categoria[];
  onEliminar: (id: number) => void;
}

export function ListaCategorias({ categorias, onEliminar }: Props) {
  const { t } = useTranslation();

  if (categorias.length === 0) {
    return <p className={styles.vacio}>{t('lateral.sinCategorias')}</p>;
  }

  return (
    <ul className={styles.lista}>
      {categorias.map((categoria) => (
        <li key={categoria.id} className={styles.item}>
          <span
            className={styles.punto}
            style={{ backgroundColor: categoria.color ?? 'var(--color-primario)' }}
          />
          <span className={styles.nombre}>{categoria.nombre}</span>
          <button
            className={styles.botonEliminar}
            onClick={() => onEliminar(categoria.id)}
            aria-label={t('lateral.eliminarCategoriaAria', { nombre: categoria.nombre })}
            title={t('lateral.eliminarCategoriaTitulo')}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}