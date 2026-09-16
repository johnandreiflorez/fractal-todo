import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { BotonIcono } from './BotonIcono.js';

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  etiquetaCerrar: string;
  children: ReactNode;
  anchoMaximo?: string;
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  etiquetaCerrar,
  children,
  anchoMaximo = 'max-w-md',
}: Props) {
  const idTitulo = useId();

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={`relative flex max-h-[85vh] w-full ${anchoMaximo} flex-col overflow-hidden rounded-xl border border-borde bg-superficie shadow-modal animate-modal-in`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-borde px-6 py-4">
          <h2
            id={idTitulo}
            className="font-display text-lg font-semibold text-texto"
          >
            {titulo}
          </h2>
          <BotonIcono etiqueta={etiquetaCerrar} onClick={onCerrar}>
            <X className="h-5 w-5" aria-hidden="true" />
          </BotonIcono>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}