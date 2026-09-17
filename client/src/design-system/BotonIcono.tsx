import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export type VarianteBotonIcono = 'fantasma' | 'superficie' | 'peligro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  etiqueta: string;
  variante?: VarianteBotonIcono;
  cargando?: boolean;
  children: ReactNode;
}

const VARIANTES: Record<VarianteBotonIcono, string> = {
  fantasma: 'text-texto-suave hover:bg-superficie-2 hover:text-texto',
  superficie:
    'border border-borde bg-superficie text-texto-suave hover:bg-superficie-2 hover:text-texto',
  peligro: 'text-peligro hover:bg-peligro-suave',
};

export function BotonIcono({
  etiqueta,
  variante = 'fantasma',
  cargando = false,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}: Props) {
  return (
    <button
      type={type}
      aria-label={etiqueta}
      title={etiqueta}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cx(
        'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-all active:scale-95',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTES[variante],
        className,
      )}
      {...props}
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
}