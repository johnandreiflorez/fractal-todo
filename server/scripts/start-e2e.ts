import { env } from '../src/config/env.js';
import { pool } from '../src/config/db.js';
import { crearServidorHttp } from '../src/servidor.js';
import { recrearBaseDePrueba } from './reset-test-db.js';

async function iniciar(): Promise<void> {
  const nombreDb = await recrearBaseDePrueba(env.DATABASE_URL);
  console.log(`Base E2E "${nombreDb}" recreada con su esquema.`);
  await pool.query('SELECT 1');
  const servidor = crearServidorHttp();
  servidor.listen(env.PORT, () => {
    console.log(`API E2E escuchando en http://localhost:${env.PORT}`);
  });
}

iniciar().catch((error: unknown) => {
  console.error('No se pudo iniciar la API E2E:', error);
  process.exit(1);
});