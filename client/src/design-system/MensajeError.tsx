import { RotateCcw } from 'lucide-react';
import { Button } from './Button.js';

interface Props {
  mensaje: string;
  onReintentar?: () => void;
  textoReintentar?: string;
}

export function MensajeError({ mensaje, onReintentar, textoReintentar }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-peligro/30 bg-peligro-suave px-4 py-6 text-center"
    >
      <p className="text-sm font-medium text-peligro-fuerte">{mensaje}</p>
      {onReintentar && (
        <Button
          variante="secundario"
          tamano="sm"
          icono={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
          onClick={onReintentar}
        >
          {textoReintentar}
        </Button>
      )}
    </div>
  );
}