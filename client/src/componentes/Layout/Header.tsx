import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Moon, Sun } from 'lucide-react';
import { BotonIcono } from '../../design-system/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { cambiarIdioma } from '../../i18n/index.js';

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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-borde-fuerte/40 bg-superficie px-6 shadow-media">
      <h1 className="font-display text-lg font-semibold text-texto">
        {t('app.titulo')}
      </h1>

      <div className="flex items-center gap-2">
        <BotonIcono
          etiqueta={
            oscuro
              ? t('encabezado.cambiarATemaClaro')
              : t('encabezado.cambiarATemaOscuro')
          }
          onClick={() => setOscuro((actual) => !actual)}
        >
          {oscuro ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </BotonIcono>

        <button
          type="button"
          onClick={() => cambiarIdioma('es')}
          aria-label={t('encabezado.idioma')}
          title={t('encabezado.espanol')}
          className="h-9 cursor-pointer rounded-md border border-borde bg-superficie px-2 text-xs font-semibold text-texto-suave transition-colors hover:border-primario hover:text-primario"
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => cambiarIdioma('en')}
          aria-label={t('encabezado.idioma')}
          title={t('encabezado.ingles')}
          className="h-9 cursor-pointer rounded-md border border-borde bg-superficie px-2 text-xs font-semibold text-texto-suave transition-colors hover:border-primario hover:text-primario"
        >
          EN
        </button>

        <span className="hidden text-sm text-texto-suave sm:inline">
          {t('encabezado.usuario', { nombre: usuario?.nombre ?? '' })}
        </span>

        <BotonIcono
          variante="peligro"
          etiqueta={t('encabezado.salir')}
          onClick={cerrarSesion}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </BotonIcono>
      </div>
    </header>
  );
}