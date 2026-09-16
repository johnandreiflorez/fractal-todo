import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { cambiarIdioma } from '../../i18n/index.js';
import styles from './Header.module.css';

export function Header() {
  const { t } = useTranslation();
  const { usuario, cerrarSesion } = useAuth();
  const [oscuro, setOscuro] = useState(
    () => document.documentElement.dataset.tema === 'oscuro',
  );

  useEffect(() => {
    document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro';
  }, [oscuro]);

  return (
    <header className={styles.encabezado}>
      <h1 className={styles.titulo}>{t('app.titulo')}</h1>
      <div className={styles.acciones}>
        <button
          className={styles.botonTema}
          onClick={() => setOscuro((actual) => !actual)}
          aria-label={
            oscuro ? t('encabezado.cambiarATemaClaro') : t('encabezado.cambiarATemaOscuro')
          }
          title={
            oscuro ? t('encabezado.cambiarATemaClaro') : t('encabezado.cambiarATemaOscuro')
          }
        >
          {oscuro ? t('encabezado.temaClaro') : t('encabezado.temaOscuro')}
        </button>
        <button
          className={styles.botonIdioma}
          onClick={() => cambiarIdioma('es')}
          aria-label={t('encabezado.idioma')}
          title={t('encabezado.espanol')}
        >
          ES
        </button>
        <button
          className={styles.botonIdioma}
          onClick={() => cambiarIdioma('en')}
          aria-label={t('encabezado.idioma')}
          title={t('encabezado.ingles')}
        >
          EN
        </button>
        <span className={styles.usuario}>
          {t('encabezado.usuario', { nombre: usuario?.nombre ?? '' })}
        </span>
        <button className={styles.botonSalir} onClick={cerrarSesion}>
          {t('encabezado.salir')}
        </button>
      </div>
    </header>
  );
}