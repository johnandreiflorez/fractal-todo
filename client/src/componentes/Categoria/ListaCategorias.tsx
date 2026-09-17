import { useTranslation } from 'react-i18next';
import { Pencil, X } from 'lucide-react';
import { BotonIcono } from '../../design-system/index.js';
import type { Categoria } from '../../tipos/index.js';

interface Props {
  categorias: Categoria[];
  eliminandoId?: number | null;
  onEliminar: (id: number) => void;
  onEditar: (categoria: Categoria) => void;
}

export function ListaCategorias({
  categorias,
  eliminandoId = null,
  onEliminar,
  onEditar,
}: Props) {
  const { t } = useTranslation();

  if (categorias.length === 0) {
    return <p className="text-sm text-texto-atenuado">{t('lateral.sinCategorias')}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {categorias.map((categoria) => (
        <li key={categoria.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-superficie-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: categoria.color ?? 'rgb(var(--primario))',
            }}
          />
          <span className="min-w-0 flex-1 truncate text-sm text-texto">
            {categoria.nombre}
          </span>
          <BotonIcono
            variante="fantasma"
            etiqueta={t('lateral.editarCategoriaAria', { nombre: categoria.nombre })}
            disabled={eliminandoId === categoria.id}
            onClick={() => onEditar(categoria)}
            className="h-7 w-7"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </BotonIcono>
          <BotonIcono
            variante="fantasma"
            etiqueta={t('lateral.eliminarCategoriaAria', { nombre: categoria.nombre })}
            cargando={eliminandoId === categoria.id}
            onClick={() => onEliminar(categoria.id)}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </BotonIcono>
        </li>
      ))}
    </ul>
  );
}