import { useTranslation } from 'react-i18next';
import styles from './MensajeError.module.css';

interface Props {
  mensaje: string;
  onReintentar?: () => void;
}

export function MensajeError({ mensaje, onReintentar }: Props) {
  const { t } = useTranslation();
  return (
    <div className={styles.contenedor} role="alert">
      <p className={styles.mensaje}>{mensaje}</p>
      {onReintentar && (
        <button className={styles.boton} onClick={onReintentar}>
          {t('comunes.reintentar')}
        </button>
      )}
    </div>
  );
}