export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  ultimo_login: Date | null;
  creado_en: Date;
  actualizado_en: Date;
}

export interface UsuarioLogueado {
  id: number;
  nombre: string;
  email: string;
}

export interface RegistroInput {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function esUsuarioLogueado(value: unknown): value is UsuarioLogueado {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'nombre' in value
  );
}