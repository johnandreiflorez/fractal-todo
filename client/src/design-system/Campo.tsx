import type { ReactNode } from 'react';
import { cx } from './cx.js';

interface Props {
  etiqueta: string;
  para: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
  className?: string;
  children: ReactNode;
}

export function Campo({
  etiqueta,
  para,
  error,
  ayuda,
  requerido = false,
  className,
  children,
}: Props) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-texto" htmlFor={para}>
        {etiqueta}
        {requerido && (
          <span className="ml-0.5 text-peligro" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-peligro-fuerte">
          {error}
        </p>
      ) : ayuda ? (
        <p className="text-sm text-texto-atenuado">{ayuda}</p>
      ) : null}
    </div>
  );
}