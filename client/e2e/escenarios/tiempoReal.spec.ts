import { Actor } from '../actor/Actor.js';
import { emailUnico } from '../datos/usuario.js';
import { expect, test } from '../fixtures.js';
import { Encabezado } from '../pages/Encabezado.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import { veTarea } from '../preguntas/listaTareas.js';
import { iniciarSesion, registrarse } from '../tareas/autenticacion.js';
import { crearTarea } from '../tareas/tareas.js';

test.describe('Actualizaciones en tiempo real', () => {
  test('sincroniza las tareas entre dos pestañas del mismo usuario', async ({
    actor,
  }) => {
    const email = emailUnico('sync');
    const password = 'password123';

    await actor.intenta(registrarse({ nombre: 'Sincronía', email, password }));
    await actor.ve(enLaListaDeTareas());
    await expect(
      new Encabezado(actor.pagina(), actor.t).estadoTiempoReal('conectado'),
    ).toBeVisible();

    const segundaPagina = await actor.pagina().context().newPage();
    const actorSecundario = new Actor('Segunda pestaña', segundaPagina);
    await actorSecundario.intenta(iniciarSesion(email, password));
    await actorSecundario.ve(enLaListaDeTareas());

    const titulo = `Tarea en vivo ${Date.now()}`;
    await actorSecundario.intenta(crearTarea({ titulo }));

    await actor.ve(veTarea(titulo));
    await segundaPagina.close();
  });
});
