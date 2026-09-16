import { pool, type Queryable } from '../config/db.js';
import type { Usuario } from '../models/usuario.js';

function mapearFila(fila: Record<string, unknown>): Usuario {
  return {
    id: Number(fila.id),
    nombre: String(fila.nombre),
    email: String(fila.email),
    password_hash: String(fila.password_hash),
    ultimo_login: fila.ultimo_login ? new Date(String(fila.ultimo_login)) : null,
    creado_en: new Date(String(fila.creado_en)),
    actualizado_en: new Date(String(fila.actualizado_en)),
  };
}

export async function crearUsuario(
  datos: { nombre: string; email: string; passwordHash: string },
  client: Queryable = pool,
): Promise<Usuario> {
  const { rows } = await client.query(
    `INSERT INTO usuarios (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [datos.nombre, datos.email, datos.passwordHash],
  );
  return mapearFila(rows[0] as Record<string, unknown>);
}

export async function buscarPorEmail(
  email: string,
  client: Queryable = pool,
): Promise<Usuario | null> {
  const { rows } = await client.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  return fila ? mapearFila(fila) : null;
}

export async function buscarPorId(
  id: number,
  client: Queryable = pool,
): Promise<Usuario | null> {
  const { rows } = await client.query(
    'SELECT * FROM usuarios WHERE id = $1',
    [id],
  );
  const fila = rows[0] as Record<string, unknown> | undefined;
  return fila ? mapearFila(fila) : null;
}

export async function registrarUltimoLogin(
  id: number,
  client: Queryable = pool,
): Promise<void> {
  await client.query(
    'UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1',
    [id],
  );
}