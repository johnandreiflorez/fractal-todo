import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type VarianteInsignia =
  | 'neutro'
  | 'primario'
  | 'informacion'
  | 'exito'
  | 'atencion'
  | 'peligro';

interface Props {
  variante?: VarianteInsignia;
  children: ReactNode;
  className?: string;
}

const VARIANTES: Record<VarianteInsignia, string> = {
  neutro: 'bg-superficie-2 text-texto-suave border border-borde',
  primario: 'bg-primario-suave text-primario-oscuro',
  informacion: 'bg-informacion-suave text-informacion',
  exito: 'bg-exito-suave text-exito-fuerte',
  atencion: 'bg-atencion-suave text-atencion-fuerte',
  peligro: 'bg-peligro-suave text-peligro-fuerte',
};

export function Badge({ variante = 'neutro', children, className }: Props) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        VARIANTES[variante],
        className,
      )}
    >
      {children}
    </span>
  );
}