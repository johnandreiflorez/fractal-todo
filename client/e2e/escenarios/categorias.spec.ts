import { emailUnico } from '../datos/usuario.js';
import { test } from '../fixtures.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import { noVeTarea, veTarea } from '../preguntas/listaTareas.js';
import { registrarse } from '../tareas/autenticacion.js';
import { crearCategoria } from '../tareas/categorias.js';
import { crearTarea, filtrarPorCategoria } from '../tareas/tareas.js';

test.describe('Categorías', () => {
  test('crea una categoría y la asigna a una tarea', async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Lucía de Prueba',
        email: emailUnico('lucia'),
        password: 'password123',
      }),
      crearCategoria('Trabajo'),
      crearTarea({ titulo: 'Preparar informe', categoria: 'Trabajo' }),
    );
    await actor.ve(veTarea('Preparar informe'));
  });

  test('filtra las tareas por categoría', async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Pablo de Prueba',
        email: emailUnico('pablo'),
        password: 'password123',
      }),
      crearCategoria('Personal'),
      crearTarea({ titulo: 'Hacer la compra', categoria: 'Personal' }),
      crearTarea({ titulo: 'Ideas sueltas' }),
      filtrarPorCategoria('Personal'),
    );
    await actor.ve(
      veTarea('Hacer la compra'),
      noVeTarea('Ideas sueltas'),
    );
    await actor.ve(enLaListaDeTareas());
  });
});