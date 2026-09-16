import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { BotonIcono } from '../../design-system/index.js';
import { useCategorias, useEliminarCategoria } from '../../hooks/useCategorias.js';
import { FormularioCategoria } from '../Categoria/FormularioCategoria.js';
import { ListaCategorias } from '../Categoria/ListaCategorias.js';

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
    <div className="rounded-xl border border-borde bg-superficie p-4 shadow-baja">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-texto">
          {t('lateral.categorias')}
        </h2>
        <BotonIcono
          etiqueta={t('lateral.nuevaCategoria')}
          onClick={() => setCrearAbierto((actual) => !actual)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </BotonIcono>
      </div>

      {crearAbierto && (
        <FormularioCategoria
          onCancelar={() => setCrearAbierto(false)}
          onCreada={() => setCrearAbierto(false)}
        />
      )}

      {error && (
        <p className="mb-3 text-sm text-peligro-fuerte">{error}</p>
      )}

      <ListaCategorias categorias={categorias} onEliminar={manejarEliminar} />
    </div>
  );
}