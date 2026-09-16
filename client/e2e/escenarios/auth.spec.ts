import { emailUnico } from '../datos/usuario.js';
import { expect, test } from '../fixtures.js';
import {
  enLaListaDeTareas,
  enLaPantallaDeLogin,
  veSesionDe,
} from '../preguntas/autenticacion.js';
import {
  cerrarSesion,
  iniciarSesion,
  iniciarSesionConError,
  registrarse,
  registrarseConConfirmacionDistinta,
} from '../tareas/autenticacion.js';

test.describe('Autenticación', () => {
  test('registra una cuenta nueva y aterriza en la lista de tareas', async ({
    actor,
  }) => {
    const nombre = 'Ana de Prueba';
    await actor.intenta(
      registrarse({ nombre, email: emailUnico('ana'), password: 'password123' }),
    );
    await actor.ve(enLaListaDeTareas(), veSesionDe(nombre));
  });

  test('cierra la sesión y vuelve a iniciarla', async ({ actor }) => {
    const nombre = 'Carlos de Prueba';
    const email = emailUnico('carlos');
    await actor.intenta(
      registrarse({ nombre, email, password: 'password123' }),
    );
    await actor.intenta(cerrarSesion());
    await actor.ve(enLaPantallaDeLogin());
    await actor.intenta(iniciarSesion(email, 'password123'));
    await actor.ve(enLaListaDeTareas(), veSesionDe(nombre));
  });

  test('rechaza credenciales incorrectas', async ({ actor }) => {
    await actor.intenta(
      iniciarSesionConError(emailUnico('nadie'), 'incorrecta'),
    );
    await actor.ve(enLaPantallaDeLogin());
  });

  test('valida que las contraseñas coincidan al registrarse', async ({
    actor,
  }) => {
    await actor.intenta(
      registrarseConConfirmacionDistinta({
        nombre: 'Dani de Prueba',
        email: emailUnico('dani'),
        password: 'password123',
        confirmacion: 'password-otra',
      }),
    );
    await expect(actor.pagina()).toHaveURL(/\/registro$/);
  });
});