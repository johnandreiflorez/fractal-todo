import { useTranslation } from 'react-i18next';
import { FormularioRegistro } from '../componentes/Auth/FormularioRegistro.js';
import styles from './PaginaAuth.module.css';

export function RegistroPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.pantalla}>
      <div className={styles.tarjeta}>
        <h2 className={styles.titulo}>{t('paginas.crearCuenta')}</h2>
        <FormularioRegistro />
      </div>
    </div>
  );
}