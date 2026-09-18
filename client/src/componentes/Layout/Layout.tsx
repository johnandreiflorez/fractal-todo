import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { PanelEstadisticas } from '../Estadisticas/PanelEstadisticas.js';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-4 md:w-60">
          <Sidebar />
          <PanelEstadisticas />
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}