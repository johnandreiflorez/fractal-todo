import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';
export type TamanoBoton = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  icono?: ReactNode;
  cargando?: boolean;
}

const VARIANTES: Record<VarianteBoton, string> = {
  primario:
    'bg-primario text-primario-contraste hover:bg-primario-oscuro shadow-baja',
  secundario:
    'bg-superficie text-texto border border-borde hover:bg-superficie-2',
  peligro: 'bg-peligro text-primario-contraste hover:bg-peligro/90 shadow-baja',
  fantasma: 'text-primario hover:bg-primario-suave',
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'gap-1.5 px-3 py-1.5 text-sm rounded-md',
  md: 'gap-2 px-4 py-2 text-sm rounded-md',
  lg: 'gap-2 px-5 py-2.5 text-base rounded-lg',
};

export function Button({
  variante = 'primario',
  tamano = 'md',
  icono,
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
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cx(
        'inline-flex cursor-pointer select-none items-center justify-center font-medium transition-all',
        'hover:brightness-105 active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...props}
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icono
      )}
      {children}
    </button>
  );
}