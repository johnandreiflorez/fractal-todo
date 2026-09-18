export type ZonaArrastre = 'izquierda' | 'derecha';

const ZONA_POR_SELECTOR: ReadonlyArray<readonly [string, ZonaArrastre]> = [
  ['[data-zona="eliminar"]', 'izquierda'],
  ['[data-zona="estado"]', 'derecha'],
];

export function zonaEnPunto(x: number, y: number): ZonaArrastre | null {
  for (const [selector, zona] of ZONA_POR_SELECTOR) {
    const elemento = document.querySelector(selector);
    if (!(elemento instanceof HTMLElement)) continue;
    const caja = elemento.getBoundingClientRect();
    if (x >= caja.left && x <= caja.right && y >= caja.top && y <= caja.bottom) {
      return zona;
    }
  }
  return null;
}
