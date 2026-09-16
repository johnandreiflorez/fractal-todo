import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en.js';
import { es } from './es.js';

const CLAVE_IDIOMA = 'fractal_todo_idioma';

export type Idioma = 'es' | 'en';

function idiomaInicial(): string {
  const guardado = localStorage.getItem(CLAVE_IDIOMA);
  if (guardado === 'es' || guardado === 'en') return guardado;
  const navegador = navigator.language?.toLowerCase() ?? '';
  return navegador.startsWith('es') ? 'es' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { traducciones: es },
    en: { traducciones: en },
  },
  lng: idiomaInicial(),
  fallbackLng: 'es',
  defaultNS: 'traducciones',
  ns: ['traducciones'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (idioma) => {
  document.documentElement.lang = idioma;
});
document.documentElement.lang = i18n.language ?? 'es';

export function cambiarIdioma(idioma: Idioma): void {
  void i18n.changeLanguage(idioma);
  localStorage.setItem(CLAVE_IDIOMA, idioma);
}

export default i18n;