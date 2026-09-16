const CLAVE_TOKEN = 'fractal_todo_token';

export interface SesionGuardada {
  token: string;
}

function esSesionGuardada(valor: unknown): valor is SesionGuardada {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'token' in valor &&
    typeof valor.token === 'string'
  );
}

export function leerSesion(): SesionGuardada | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_TOKEN);
    if (!crudo) return null;
    const valor: unknown = JSON.parse(crudo);
    return esSesionGuardada(valor) ? { token: valor.token } : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: SesionGuardada): void {
  sessionStorage.setItem(CLAVE_TOKEN, JSON.stringify({ token: sesion.token }));
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(CLAVE_TOKEN);
}

export function obtenerToken(): string | null {
  return leerSesion()?.token ?? null;
}