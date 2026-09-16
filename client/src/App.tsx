import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cargando } from './componentes/Comunes/Cargando.js';
import { Layout } from './componentes/Layout/Layout.js';
import { useAuth } from './hooks/useAuth.js';
import { LoginPage } from './pages/LoginPage.js';
import { PaginaTareas } from './pages/PaginaTareas.js';
import { RegistroPage } from './pages/RegistroPage.js';

function RutaPrivada() {
  const { t } = useTranslation();
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();
  if (cargando) return <Cargando texto={t('comunes.cargandoSesion')} />;
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <Layout />;
}

function RutaPublica() {
  const { t } = useTranslation();
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando texto={t('comunes.cargandoSesion')} />;
  if (usuario) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RutaPrivada />}>
        <Route index element={<PaginaTareas />} />
      </Route>
      <Route path="/login" element={<RutaPublica />}>
        <Route index element={<LoginPage />} />
      </Route>
      <Route path="/registro" element={<RutaPublica />}>
        <Route index element={<RegistroPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}