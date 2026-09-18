import { useEffect, useRef } from 'react';

export interface AtajoTeclado {
  teclas: string;
  accion: () => void;
}

interface Combo {
  tecla: string;
  mod: boolean;
  shift: boolean;
}

function parsear(teclas: string): Combo {
  const partes = teclas.toLowerCase().split('+').filter(Boolean);
  return {
    tecla: partes[partes.length - 1] ?? '',
    mod: partes.includes('mod'),
    shift: partes.includes('shift'),
  };
}

const TIPOS_INPUT_NO_EDITABLES = new Set([
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
]);

function enCampoEditable(objetivo: EventTarget | null): boolean {
  if (!(objetivo instanceof HTMLElement)) return false;
  if (objetivo instanceof HTMLInputElement) {
    return !TIPOS_INPUT_NO_EDITABLES.has(objetivo.type.toLowerCase());
  }
  const etiqueta = objetivo.tagName.toLowerCase();
  return (
    etiqueta === 'textarea' ||
    etiqueta === 'select' ||
    objetivo.isContentEditable
  );
}

export function useAtajosTeclado(
  atajos: readonly AtajoTeclado[],
  habilitado = true,
): void {
  const ref = useRef(atajos);

  useEffect(() => {
    ref.current = atajos;
  });

  useEffect(() => {
    if (!habilitado) return;

    const manejar = (evento: KeyboardEvent) => {
      if (evento.defaultPrevented || evento.repeat || evento.altKey) return;
      if (enCampoEditable(evento.target)) return;

      const tecla = evento.key.toLowerCase();
      const mod = evento.ctrlKey || evento.metaKey;

      for (const atajo of ref.current) {
        const combo = parsear(atajo.teclas);
        if (
          combo.tecla !== tecla ||
          combo.mod !== mod ||
          combo.shift !== evento.shiftKey
        ) {
          continue;
        }
        evento.preventDefault();
        atajo.accion();
        return;
      }
    };

    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, [habilitado]);
}
