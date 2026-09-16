import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  texto?: string;
  children?: ReactNode;
}

export function IndicadorCarga({ texto }: Props) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-10 text-texto-suave"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      {texto && <p className="text-sm">{texto}</p>}
    </div>
  );
}