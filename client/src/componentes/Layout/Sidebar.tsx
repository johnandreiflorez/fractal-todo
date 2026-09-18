import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { BotonIcono, IndicadorCarga } from '../../design-system/index.js';
import { useAtajosTeclado } from '../../hooks/useAtajosTeclado.js';
import { useCategorias, useEliminarCategoria } from '../../hooks/useCategorias.js';
import type { Categoria } from '../../tipos/index.js';
import { FormularioCategoria } from '../Categoria/FormularioCategoria.js';
import { ListaCategorias } from '../Categoria/ListaCategorias.js';

export function Sidebar() {
  const { t } = useTranslation();
  const { data: categorias = [], isPending: cargandoCategorias } = useCategorias();
  const eliminar = useEliminarCategoria();
  const [error, setError] = useState<string | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState<Categoria | null>(null);

  const eliminandoId = eliminar.isPending ? eliminar.variables ?? null : null;

  const manejarEliminar = async (id: number) => {
    try {
      setError(null);
      await eliminar.mutateAsync(id);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  const manejarEditar = (categoria: Categoria) => {
    setCrearAbierto(false);
    setCategoriaEnEdicion((actual) => (actual?.id === categoria.id ? null : categoria));
  };

  useAtajosTeclado(
    [
      {
        teclas: 'c',
        accion: () => {
          setCrearAbierto(true);
          setCategoriaEnEdicion(null);
        },
      },
    ],
    !crearAbierto && !categoriaEnEdicion,
  );

  return (
    <div className="rounded-xl border border-borde bg-superficie p-4 shadow-baja transition-all duration-200 hover:shadow-media">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-texto">
          {t('lateral.categorias')}
        </h2>
        <BotonIcono
          etiqueta={t('lateral.nuevaCategoria')}
          aria-keyshortcuts="C"
          onClick={() => {
            setCrearAbierto((actual) => !actual);
            setCategoriaEnEdicion(null);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </BotonIcono>
      </div>

      {crearAbierto && (
        <FormularioCategoria
          onCancelar={() => setCrearAbierto(false)}
          onGuardada={() => setCrearAbierto(false)}
        />
      )}

      {!crearAbierto && categoriaEnEdicion && (
        <FormularioCategoria
          categoria={categoriaEnEdicion}
          onCancelar={() => setCategoriaEnEdicion(null)}
          onGuardada={() => setCategoriaEnEdicion(null)}
        />
      )}

      {error && (
        <p className="mb-3 text-sm text-peligro-fuerte">{error}</p>
      )}

      {cargandoCategorias ? (
        <IndicadorCarga texto={t('comunes.cargando')} />
      ) : (
        <ListaCategorias
          categorias={categorias}
          eliminandoId={eliminandoId}
          onEliminar={manejarEliminar}
          onEditar={manejarEditar}
        />
      )}
    </div>
  );
}