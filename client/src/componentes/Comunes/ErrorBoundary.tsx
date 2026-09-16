import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface Estado {
  error: Error | null;
}

class ErrorBoundaryBase extends Component<Props & WithTranslation, Estado> {
  state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    const { t, children } = this.props;
    if (this.state.error) {
      return (
        <div className={styles.contenedor} role="alert">
          <h2 className={styles.titulo}>{t('comunes.algoSaliomal')}</h2>
          <p className={styles.mensaje}>{this.state.error.message}</p>
          <button
            className={styles.boton}
            onClick={() => this.setState({ error: null })}
          >
            {t('comunes.volverAIntentar')}
          </button>
        </div>
      );
    }
    return children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);