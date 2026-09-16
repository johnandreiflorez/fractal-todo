import { tarea } from '../actor/Tarea.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';

export const navegarA = (ruta: string) =>
  tarea(`navegar a "${ruta}"`, async (actor) => {
    await actor.pagina().goto(ruta);
  });

export const abrirListaDeTareas = () =>
  tarea('abrir la lista de tareas', async (actor) => {
    const tareas = new PaginaTareas(actor.pagina(), actor.t);
    await tareas.esperarCarga();
  });