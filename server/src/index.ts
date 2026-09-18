import { env } from './config/env.js';
import { pool } from './config/db.js';
import { crearServidorHttp } from './servidor.js';

async function iniciar(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    const servidor = crearServidorHttp();
    servidor.listen(env.PORT, '0.0.0.0', () => {
      console.log(`API escuchando en el puerto ${env.PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

void iniciar();