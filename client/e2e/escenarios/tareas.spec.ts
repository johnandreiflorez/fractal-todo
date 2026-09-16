import { emailUnico } from '../datos/usuario.js';
import { expect, test } from '../fixtures.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import {
  noVeTarea,
  veOrdenDeTareas,
  veSeleccionadas,
  veTarea,
} from '../preguntas/listaTareas.js';
import { registrarse } from '../tareas/autenticacion.js';
import {
  buscarTareas,
  completarSeleccionadas,
  completarTarea,
  crearTarea,
  editarTarea,
  eliminarTarea,
  filtrarPorEstado,
  filtrarPorPrioridad,
  limpiarFiltros,
  ordenarTareasPor,
  seleccionarVisibles,
} from '../tareas/tareas.js';

test.describe('Gestión de tareas', () => {
  test.beforeEach(async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'María de Prueba',
        email: emailUnico('maria'),
        password: 'password123',
      }),
    );
    await actor.ve(enLaListaDeTareas());
  });

  test('crea una tarea con etiqueta y la ve en la lista', async ({ actor }) => {
    await actor.intenta(
      crearTarea({
        titulo: 'Comprar pan',
        descripcion: 'En la panadería',
        etiquetas: ['casa'],
      }),
    );
    await actor.ve(veTarea('Comprar pan'));
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await expect(tareas.item('Comprar pan').getByText('casa')).toBeVisible();
  });

  test('edita el título y la prioridad de una tarea', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Borrador' }),
      editarTarea('Borrador', { titulo: 'Borrador final', prioridad: 1 }),
    );
    await actor.ve(veTarea('Borrador final'), noVeTarea('Borrador'));
  });

  test('completa una tarea y la encuentra al filtrar por estado', async ({
    actor,
  }) => {
    await actor.intenta(crearTarea({ titulo: 'Llamar al médico' }));
    await actor.intenta(completarTarea('Llamar al médico'));
    await actor.intenta(filtrarPorEstado('pendientes'));
    await actor.ve(noVeTarea('Llamar al médico'));
    await actor.intenta(filtrarPorEstado('completadas'));
    await actor.ve(veTarea('Llamar al médico'));
  });

  test('busca tareas por texto', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Comprar pan' }),
      crearTarea({ titulo: 'Llamar al médico' }),
      buscarTareas('comprar'),
    );
    await actor.ve(veTarea('Comprar pan'), noVeTarea('Llamar al médico'));
  });

  test('filtra por prioridad', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Apagar incendio', prioridad: 1 }),
      crearTarea({ titulo: 'Regar plantas', prioridad: 5 }),
      filtrarPorPrioridad(1),
    );
    await actor.ve(veTarea('Apagar incendio'), noVeTarea('Regar plantas'));
  });

  test('ordena por prioridad ascendente', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Regar plantas', prioridad: 5 }),
      crearTarea({ titulo: 'Apagar incendio', prioridad: 1 }),
      crearTarea({ titulo: 'Ordenar escritorio', prioridad: 3 }),
      ordenarTareasPor('prioridad', 'asc'),
    );
    await actor.ve(
      veOrdenDeTareas(['Apagar incendio', 'Ordenar escritorio', 'Regar plantas']),
    );
  });

  test('completa varias tareas en lote', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Pendiente A' }),
      crearTarea({ titulo: 'Pendiente B' }),
      seleccionarVisibles(),
    );
    await actor.ve(veSeleccionadas(2));
    await actor.intenta(
      completarSeleccionadas(),
      filtrarPorEstado('completadas'),
    );
    await actor.ve(veTarea('Pendiente A'), veTarea('Pendiente B'));
    await actor.intenta(filtrarPorEstado('pendientes'));
    await actor.ve(noVeTarea('Pendiente A'), noVeTarea('Pendiente B'));
  });

  test('elimina una tarea confirmando el diálogo', async ({ actor }) => {
    await actor.intenta(crearTarea({ titulo: 'Basura' }));
    await actor.intenta(eliminarTarea('Basura'));
    await actor.ve(noVeTarea('Basura'));
  });

  test('se limpian los filtros y reaparecen las tareas', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Comprar pan' }),
      crearTarea({ titulo: 'Llamar al médico' }),
      buscarTareas('comprar'),
    );
    await actor.ve(veTarea('Comprar pan'), noVeTarea('Llamar al médico'));
    await actor.intenta(limpiarFiltros());
    await actor.ve(veTarea('Comprar pan'), veTarea('Llamar al médico'));
  });
});