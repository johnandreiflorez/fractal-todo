import { useTranslation } from 'react-i18next';
import { FormularioLogin } from '../componentes/Auth/FormularioLogin.js';
import { Card } from '../design-system/index.js';

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-fondo to-superficie p-4">
      <Card className="w-full max-w-sm animate-rise-in p-6 shadow-elevada">
        <h2 className="mb-4 text-center font-display text-xl font-semibold text-texto">
          {t('paginas.iniciarSesion')}
        </h2>
        <FormularioLogin />
      </Card>
    </div>
  );
}