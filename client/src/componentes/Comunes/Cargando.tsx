import { useTranslation } from 'react-i18next';
import styles from './Cargando.module.css';

export function Cargando({ texto }: { texto?: string }) {
  const { t } = useTranslation();
  const etiqueta = texto ?? t('comunes.cargando');
  return (
    <div className={styles.contenedor} role="status" aria-live="polite">
      <span className={styles.rueda} aria-hidden="true" />
      <p className={styles.texto}>{etiqueta}</p>
    </div>
  );
}