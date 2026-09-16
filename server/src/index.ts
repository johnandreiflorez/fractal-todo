import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function iniciar(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    app.listen(env.PORT, () => {
      console.log(`API escuchando en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

void iniciar();