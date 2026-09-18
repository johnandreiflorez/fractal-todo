const API_ORIGEN = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

export const USANDO_API_EXTERNA = API_ORIGEN.length > 0;

export function urlBaseApi(): string {
  return USANDO_API_EXTERNA ? `${API_ORIGEN}/api` : '/api';
}

export function urlTiempoReal(token: string): string {
  const ruta = `/ws?token=${encodeURIComponent(token)}`;
  if (USANDO_API_EXTERNA) {
    const origen = new URL(API_ORIGEN);
    const protocolo = origen.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocolo}//${origen.host}${ruta}`;
  }
  const protocolo = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocolo}//${window.location.host}${ruta}`;
}
