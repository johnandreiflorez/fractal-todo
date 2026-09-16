import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icono?: ReactNode;
}

export function Entrada({ icono, className, ...props }: Props) {
  return (
    <div className="relative">
      {icono && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-texto-atenuado">
          {icono}
        </span>
      )}
      <input
        className={cx(
          'w-full rounded-md border border-borde bg-superficie px-3 py-2 text-sm text-texto shadow-baja transition-colors',
          'placeholder:text-texto-atenuado',
          'focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          icono ? 'pl-9' : '',
          className,
        )}
        {...props}
      />
    </div>
  );
}