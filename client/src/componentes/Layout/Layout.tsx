import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.esqueleto}>
      <Header />
      <div className={styles.cuerpo}>
        <aside className={styles.lateral}>
          <Sidebar />
        </aside>
        <main className={styles.principal}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}