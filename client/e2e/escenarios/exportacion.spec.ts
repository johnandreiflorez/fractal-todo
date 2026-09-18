import { readFile } from 'node:fs/promises';
import { emailUnico } from '../datos/usuario.js';
import { expect, test } from '../fixtures.js';
import { PaginaTareas } from '../pages/PaginaTareas.js';
import { enLaListaDeTareas } from '../preguntas/autenticacion.js';
import { registrarse } from '../tareas/autenticacion.js';
import { crearTarea } from '../tareas/tareas.js';

test.describe('Exportar tareas', () => {
  test.beforeEach(async ({ actor }) => {
    await actor.intenta(
      registrarse({
        nombre: 'Ana Exportadora',
        email: emailUnico('exportadora'),
        password: 'password123',
      }),
    );
    await actor.ve(enLaListaDeTareas());
  });

  test('descarga un CSV con todas las tareas', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Comprar pan' }),
      crearTarea({ titulo: 'Llamar al médico' }),
    );

    const pagina = actor.pagina();
    const tareas = new PaginaTareas(pagina, actor.t);
    const [descarga] = await Promise.all([
      pagina.waitForEvent('download'),
      tareas.botonExportarCsv().click(),
    ]);

    expect(descarga.suggestedFilename()).toMatch(/^tareas-\d{4}-\d{2}-\d{2}\.csv$/);
    const contenido = await readFile(await descarga.path(), 'utf8');
    expect(contenido).toContain('id,titulo,descripcion,prioridad');
    expect(contenido).toContain('Comprar pan');
    expect(contenido).toContain('Llamar al médico');
  });

  test('descarga un JSON con todas las tareas', async ({ actor }) => {
    await actor.intenta(
      crearTarea({ titulo: 'Comprar pan' }),
      crearTarea({ titulo: 'Llamar al médico' }),
    );

    const pagina = actor.pagina();
    const tareas = new PaginaTareas(pagina, actor.t);
    const [descarga] = await Promise.all([
      pagina.waitForEvent('download'),
      tareas.botonExportarJson().click(),
    ]);

    expect(descarga.suggestedFilename()).toMatch(/^tareas-\d{4}-\d{2}-\d{2}\.json$/);
    const contenido = await readFile(await descarga.path(), 'utf8');
    const datos: unknown = JSON.parse(contenido);
    if (!Array.isArray(datos)) {
      throw new Error('El archivo descargado no es un arreglo JSON');
    }
    expect(datos).toHaveLength(2);
    expect(contenido).toContain('Comprar pan');
    expect(contenido).toContain('Llamar al médico');
  });
});
