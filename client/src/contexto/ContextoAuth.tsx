import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { obtenerPerfil } from '../servicios/auth.service.js';
import { guardarSesion, leerSesion, limpiarSesion } from '../utils/authStorage.js';
import type { Sesion, UsuarioLogueado } from '../tipos/index.js';

interface ContextoAuthType {
  usuario: UsuarioLogueado | null;
  cargando: boolean;
  iniciarSesion: (sesion: Sesion) => void;
  cerrarSesion: () => void;
}

const ContextoAuth = createContext<ContextoAuthType | null>(null);

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(() => {
    limpiarSesion();
    setUsuario(null);
  }, []);

  useEffect(() => {
    const sesionGuardada = leerSesion();
    if (!sesionGuardada) {
      setCargando(false);
      return;
    }
    guardarSesion({ token: sesionGuardada.token });
    obtenerPerfil()
      .then((perfil) => {
        setUsuario(perfil);
        guardarSesion({ token: sesionGuardada.token });
      })
      .catch(() => cerrarSesion())
      .finally(() => setCargando(false));
  }, [cerrarSesion]);

  useEffect(() => {
    const alNoAutorizado = () => cerrarSesion();
    window.addEventListener('auth:no-autorizado', alNoAutorizado);
    return () => window.removeEventListener('auth:no-autorizado', alNoAutorizado);
  }, [cerrarSesion]);

  const iniciarSesion = useCallback((sesion: Sesion) => {
    guardarSesion({ token: sesion.token });
    setUsuario(sesion.usuario);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  );

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}

export function useAuth(): ContextoAuthType {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de ProveedorAuth');
  }
  return contexto;
}