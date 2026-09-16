import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cx } from './cx.js';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Selector({ className, children, ...props }: Props) {
  return (
    <div className="relative">
      <select
        className={cx(
          'w-full appearance-none rounded-md border border-borde bg-superficie px-3 py-2 pr-9 text-sm text-texto shadow-baja transition-colors',
          'focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-texto-atenuado"
        aria-hidden="true"
      />
    </div>
  );
}