import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { urlTiempoReal } from '../config/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { obtenerToken } from '../utils/authStorage.js';
import { esMensajeCambio } from '../tipos/index.js';

export type EstadoTiempoReal = 'conectando' | 'conectado' | 'desconectado';

interface ContextoTiempoRealType {
  estado: EstadoTiempoReal;
}

const ContextoTiempoReal = createContext<ContextoTiempoRealType | null>(null);

const RECONEXION_BASE_MS = 1_000;
const RECONEXION_MAX_MS = 15_000;
const CODIGO_NO_AUTORIZADO = 4001;

export function ProveedorTiempoReal({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoTiempoReal>('desconectado');

  useEffect(() => {
    const token = usuario ? obtenerToken() : null;
    if (!token) {
      setEstado('desconectado');
      return;
    }

    let socket: WebSocket | null = null;
    let temporizador: number | null = null;
    let intentos = 0;
    let cancelado = false;

    const limpiarTemporizador = () => {
      if (temporizador !== null) {
        window.clearTimeout(temporizador);
        temporizador = null;
      }
    };

    const conectar = () => {
      setEstado('conectando');
      const actual = new WebSocket(urlTiempoReal(token));
      socket = actual;

      actual.onopen = () => {
        intentos = 0;
        setEstado('conectado');
      };

      actual.onmessage = (evento: MessageEvent<unknown>) => {
        if (typeof evento.data !== 'string') return;
        let datos: unknown;
        try {
          datos = JSON.parse(evento.data);
        } catch {
          return;
        }
        if (!esMensajeCambio(datos)) return;
        for (const recurso of datos.recursos) {
          void queryClient.invalidateQueries({ queryKey: [recurso] });
        }
      };

      actual.onerror = () => {
        actual.close();
      };

      actual.onclose = (evento: CloseEvent) => {
        socket = null;
        if (cancelado) return;
        if (evento.code === CODIGO_NO_AUTORIZADO) {
          cancelado = true;
          setEstado('desconectado');
          return;
        }
        intentos += 1;
        const espera = Math.min(
          RECONEXION_BASE_MS * 2 ** (intentos - 1),
          RECONEXION_MAX_MS,
        );
        setEstado('conectando');
        temporizador = window.setTimeout(conectar, espera);
      };
    };

    conectar();

    return () => {
      cancelado = true;
      limpiarTemporizador();
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
        socket = null;
      }
    };
  }, [usuario, queryClient]);

  const valor = useMemo(() => ({ estado }), [estado]);

  return (
    <ContextoTiempoReal.Provider value={valor}>{children}</ContextoTiempoReal.Provider>
  );
}

export function useTiempoReal(): ContextoTiempoRealType {
  const contexto = useContext(ContextoTiempoReal);
  if (!contexto) {
    throw new Error('useTiempoReal debe usarse dentro de ProveedorTiempoReal');
  }
  return contexto;
}
