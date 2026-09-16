import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const directorioActual = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_TEST_DATABASE_URL =
  'postgres://todo:todo123@localhost:5432/todo_list_test';

export async function recrearBaseDePrueba(databaseUrl: string): Promise<string> {
  const url = new URL(databaseUrl);
  const nombreDb = url.pathname.replace(/^\//, '') || 'todo_list_test';
  const urlAdmin = new URL(url);
  urlAdmin.pathname = '/postgres';

  const admin = new pg.Client({ connectionString: urlAdmin.toString() });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${nombreDb}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${nombreDb}"`);
  } finally {
    await admin.end();
  }

  const db = new pg.Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    const rutaSchema = join(directorioActual, '..', 'sql', 'schema.sql');
    const sql = readFileSync(rutaSchema, 'utf8');
    await db.query(sql);
  } finally {
    await db.end();
  }

  return nombreDb;
}

async function main(): Promise<void> {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  const nombreDb = await recrearBaseDePrueba(databaseUrl);
  console.log(`Base de datos de prueba "${nombreDb}" recreada con su esquema.`);
}

const ejecutadoDirectamente =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (ejecutadoDirectamente) {
  main().catch((error: unknown) => {
    console.error('No se pudo preparar la base de datos de prueba:', error);
    process.exit(1);
  });
}