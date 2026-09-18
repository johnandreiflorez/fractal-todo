import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Tecla({ children }: Props) {
  return (
    <kbd
      aria-hidden="true"
      className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-borde bg-superficie-2 px-1.5 font-sans text-xs font-semibold text-texto-suave"
    >
      {children}
    </kbd>
  );
}
