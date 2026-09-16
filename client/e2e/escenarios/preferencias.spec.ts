import { emailUnico } from '../datos/usuario.js';
import { test } from '../fixtures.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import {
  idiomaEs,
  temaEs,
  veBotonDeSalir,
} from '../preguntas/preferencias.js';
import { registrarse } from '../tareas/autenticacion.js';
import { alternarTema, cambiarIdioma } from '../tareas/preferencias.js';

test.describe('Idioma y tema', () => {
  test('cambia el idioma a inglés y vuelve a español', async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Sofía de Prueba',
        email: emailUnico('sofia'),
        password: 'password123',
      }),
    );
    await actor.ve(enLaListaDeTareas());
    await actor.intenta(cambiarIdioma('en'));
    await actor.ve(veBotonDeSalir(), idiomaEs('en'));
    await actor.intenta(cambiarIdioma('es'));
    await actor.ve(veBotonDeSalir(), idiomaEs('es'));
  });

  test('alterna entre el tema claro y el oscuro', async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Diego de Prueba',
        email: emailUnico('diego'),
        password: 'password123',
      }),
    );
    await actor.ve(temaEs('claro'));
    await actor.intenta(alternarTema());
    await actor.ve(temaEs('oscuro'));
    await actor.intenta(alternarTema());
    await actor.ve(temaEs('claro'));
  });
});