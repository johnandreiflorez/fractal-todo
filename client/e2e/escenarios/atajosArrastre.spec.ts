import { expect, test } from '../fixtures.js';
import { emailUnico } from '../datos/usuario.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';
import { Sidebar } from '../pages/Sidebar.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import { noVeTarea, veSeleccionadas } from '../preguntas/listaTareas.js';
import { registrarse } from '../tareas/autenticacion.js';
import {
  arrastrarTareaA,
  crearTarea,
  presionarAtajo,
  seleccionarTarea,
} from '../tareas/tareas.js';

test.describe('Atajos de teclado y arrastrar y soltar', () => {
  test.beforeEach(async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Teo Atajos',
        email: emailUnico('atajos'),
        password: 'password123',
      }),
    );
    await actor.ve(enLaListaDeTareas());
  });

  test('abre el formulario de nueva tarea con la tecla N', async ({ actor }) => {
    const pagina = actor.pagina();
    await actor.intenta(presionarAtajo('n'));
    await expect(pagina.locator('#campo-titulo')).toBeVisible();
  });

  test('abre el formulario de nueva categoría con la tecla C', async ({ actor }) => {
    const sidebar = new Sidebar(actor.pagina(), actor.t);
    await actor.intenta(presionarAtajo('c'));
    await expect(sidebar.campoNombre()).toBeVisible();
  });

  test('selecciona todas las visibles con Ctrl+A', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Uno' }),
      crearTarea({ titulo: 'Dos' }),
      presionarAtajo('Control+a'),
    );
    await actor.ve(veSeleccionadas(2));
  });

  test('completa y reabre las seleccionadas con X y Shift+X', async ({ actor }) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await actor.intenta(
      crearTarea({ titulo: 'Informe' }),
      seleccionarTarea('Informe'),
      presionarAtajo('x'),
    );
    await expect(tareas.botonReabrir('Informe')).toBeVisible();
    await actor.intenta(seleccionarTarea('Informe'), presionarAtajo('Shift+x'));
    await expect(tareas.botonCompletar('Informe')).toBeVisible();
  });

  test('elimina las seleccionadas con la tecla Delete', async ({ actor }) => {
    const pagina = actor.pagina();
    await actor.intenta(
      crearTarea({ titulo: 'Borrar con tecla' }),
      seleccionarTarea('Borrar con tecla'),
    );
    pagina.once('dialog', (dialogo) => void dialogo.accept());
    await actor.intenta(presionarAtajo('Delete'));
    await actor.ve(noVeTarea('Borrar con tecla'));
  });

  test('arrastrar a la izquierda elimina la tarea', async ({ actor }) => {
    const pagina = actor.pagina();
    await actor.intenta(crearTarea({ titulo: 'Arrastrar para borrar' }));
    pagina.once('dialog', (dialogo) => void dialogo.accept());
    await actor.intenta(arrastrarTareaA('Arrastrar para borrar', 'eliminar'));
    await actor.ve(noVeTarea('Arrastrar para borrar'));
  });

  test('arrastrar a la derecha completa la tarea', async ({ actor }) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await actor.intenta(
      crearTarea({ titulo: 'Arrastrar para completar' }),
      arrastrarTareaA('Arrastrar para completar', 'estado'),
    );
    await expect(tareas.botonReabrir('Arrastrar para completar')).toBeVisible();
  });

  test('la tarjeta flotante sigue al puntero durante el arrastre', async ({ actor }) => {
    const pagina = actor.pagina();
    const tareas = new PaginaTareas(pagina, actor.t);
    await actor.intenta(crearTarea({ titulo: 'Fantasma visible' }));

    await tareas.iniciarArrastre('Fantasma visible');

    const ancho = pagina.viewportSize()?.width ?? 1280;
    const destino = { x: ancho - 180, y: 220 };
    await tareas.moverPunteroA(destino.x, destino.y);

    await expect
      .poll(async () => {
        const caja = await tareas.fantasmaArrastre().boundingBox();
        if (!caja) return Number.POSITIVE_INFINITY;
        return Math.abs(caja.x + caja.width / 2 - destino.x);
      })
      .toBeLessThan(8);

    await tareas.moverPunteroA(ancho / 2, 400);
    await tareas.soltarPuntero();
    await expect(tareas.fantasmaArrastre()).toBeHidden();
  });
});
