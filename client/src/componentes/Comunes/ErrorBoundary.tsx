import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { Button } from '../../design-system/index.js';

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
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
          role="alert"
        >
          <h2 className="font-display text-xl font-semibold text-texto">
            {t('comunes.algoSaliomal')}
          </h2>
          <p className="max-w-md text-sm text-texto-suave">{this.state.error.message}</p>
          <Button
            variante="secundario"
            onClick={() => this.setState({ error: null })}
          >
            {t('comunes.volverAIntentar')}
          </Button>
        </div>
      );
    }
    return children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);