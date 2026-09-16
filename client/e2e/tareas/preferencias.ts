import { tarea } from '../actor/Tarea.js';
import type { Idioma } from '../i18n/recursos.js';
import { Encabezado } from '../pages/Encabezado.js';

export const cambiarIdioma = (idioma: Idioma) =>
  tarea(`cambiar el idioma a "${idioma}"`, async (actor) => {
    const encabezado = new Encabezado(actor.pagina(), actor.t);
    if (idioma === 'en') {
      await encabezado.botonIngles().click();
    } else {
      await encabezado.botonEspanol().click();
    }
    actor.alternarIdioma();
  });

export const alternarTema = () =>
  tarea('alternar el tema claro/oscuro', async (actor) => {
    const pagina = actor.pagina();
    const encabezado = new Encabezado(pagina, actor.t);
    const tema = await pagina.evaluate(() => document.documentElement.dataset.tema);
    if (tema === 'oscuro') {
      await encabezado.botonTemaClaro().click();
    } else {
      await encabezado.botonTemaOscuro().click();
    }
  });