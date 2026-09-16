import { useTranslation } from 'react-i18next';
import { FormularioRegistro } from '../componentes/Auth/FormularioRegistro.js';
import { Card } from '../design-system/index.js';

export function RegistroPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-fondo to-superficie p-4">
      <Card className="w-full max-w-sm animate-rise-in p-6 shadow-elevada">
        <h2 className="mb-4 text-center font-display text-xl font-semibold text-texto">
          {t('paginas.crearCuenta')}
        </h2>
        <FormularioRegistro />
      </Card>
    </div>
  );
}