import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/sora';
import '@fontsource-variable/manrope';
import App from './App';
import { ErrorBoundary } from './componentes/Comunes/ErrorBoundary';
import { ProveedorAuth } from './contexto/ContextoAuth';
import { ProveedorTiempoReal } from './contexto/ContextoTiempoReal';
import './index.css';
import './i18n/index.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const raiz = document.getElementById('root');
if (!raiz) throw new Error('No se encontró el elemento #root');

createRoot(raiz).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProveedorAuth>
            <ProveedorTiempoReal>
              <App />
            </ProveedorTiempoReal>
          </ProveedorAuth>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);