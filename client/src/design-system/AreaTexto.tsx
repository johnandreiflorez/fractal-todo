import type { TextareaHTMLAttributes } from 'react';
import { cx } from './cx.js';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function AreaTexto({ className, rows = 3, ...props }: Props) {
  return (
    <textarea
      rows={rows}
      className={cx(
        'w-full resize-y rounded-md border border-borde bg-superficie px-3 py-2 text-sm text-texto shadow-baja transition-colors',
        'placeholder:text-texto-atenuado',
        'focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}