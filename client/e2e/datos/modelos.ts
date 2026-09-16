export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmacion?: string;
}

export interface DatosTarea {
  titulo: string;
  descripcion?: string;
  prioridad?: number;
  categoria?: string;
  fecha?: string;
  etiquetas?: string[];
}