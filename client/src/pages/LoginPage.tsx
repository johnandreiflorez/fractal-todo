import { useTranslation } from 'react-i18next';
import { FormularioLogin } from '../componentes/Auth/FormularioLogin.js';
import styles from './PaginaAuth.module.css';

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.pantalla}>
      <div className={styles.tarjeta}>
        <h2 className={styles.titulo}>{t('paginas.iniciarSesion')}</h2>
        <FormularioLogin />
      </div>
    </div>
  );
}