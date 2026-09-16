import { en } from '../../src/i18n/en.js';
import { es } from '../../src/i18n/es.js';
import type { Traducciones } from '../../src/i18n/es.js';

export type Idioma = 'es' | 'en';

const RECURSOS: Record<Idioma, Traducciones> = { es, en };

function obtener(recurso: Traducciones, clave: string): string {
  let valor: unknown = recurso;
  for (const parte of clave.split('.')) {
    if (valor == null || typeof valor !== 'object') return clave;
    valor = (valor as Record<string, unknown>)[parte];
  }
  return typeof valor === 'string' ? valor : clave;
}

function buscar(
  recurso: Traducciones,
  clave: string,
  count?: number,
): string {
  const directo = obtener(recurso, clave);
  if (directo !== clave) return directo;
  if (count !== undefined) {
    const sufijo = count === 1 ? '_one' : '_other';
    const plural = obtener(recurso, `${clave}${sufijo}`);
    if (plural !== `${clave}${sufijo}`) return plural;
  }
  return directo;
}

function interpolar(texto: string, opciones?: Record<string, unknown>): string {
  if (!opciones) return texto;
  return texto.replace(/\{\{(\w+)\}\}/g, (coincidencia, nombre: string) =>
    opciones[nombre] != null ? String(opciones[nombre]) : coincidencia,
  );
}

export type Traductor = (
  clave: string,
  opciones?: Record<string, unknown>,
) => string;

export class Recursos {
  idioma: Idioma = 'es';
  readonly t: Traductor = (clave, opciones) => {
    const count =
      typeof opciones?.count === 'number' ? opciones.count : undefined;
    return interpolar(buscar(RECURSOS[this.idioma], clave, count), opciones);
  };

  alternarIdioma(): void {
    this.idioma = this.idioma === 'es' ? 'en' : 'es';
  }
}