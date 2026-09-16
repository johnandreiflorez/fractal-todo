import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mensajeDeError } from '../../api/cliente.js';
import { useCategorias, useEliminarCategoria } from '../../hooks/useCategorias.js';
import { FormularioCategoria } from '../Categoria/FormularioCategoria.js';
import { ListaCategorias } from '../Categoria/ListaCategorias.js';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { t } = useTranslation();
  const { data: categorias = [] } = useCategorias();
  const eliminar = useEliminarCategoria();
  const [error, setError] = useState<string | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);

  const manejarEliminar = async (id: number) => {
    try {
      setError(null);
      await eliminar.mutateAsync(id);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo}>{t('lateral.categorias')}</h2>
        <button
          className={styles.botonNueva}
          onClick={() => setCrearAbierto((actual) => !actual)}
          aria-label={t('lateral.nuevaCategoria')}
          title={t('lateral.nuevaCategoria')}
        >
          +
        </button>
      </div>

      {crearAbierto && (
        <FormularioCategoria
          onCancelar={() => setCrearAbierto(false)}
          onCreada={() => setCrearAbierto(false)}
        />
      )}

      {error && <p className={styles.error}>{error}</p>}

      <ListaCategorias categorias={categorias} onEliminar={manejarEliminar} />
    </div>
  );
}