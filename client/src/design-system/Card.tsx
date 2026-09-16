import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  sinSombra?: boolean;
}

export function Card({ sinSombra = false, className, children, ...props }: Props) {
  return (
    <div
      className={cx(
        'rounded-xl border border-borde bg-superficie p-5',
        sinSombra ? '' : 'shadow-baja',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}