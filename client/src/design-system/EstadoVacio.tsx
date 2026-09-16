import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  mensaje: string;
  icono?: ReactNode;
}

export function EstadoVacio({ mensaje, icono }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-superficie-2 text-texto-atenuado">
        {icono ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </span>
      <p className="text-sm text-texto-suave">{mensaje}</p>
    </div>
  );
}