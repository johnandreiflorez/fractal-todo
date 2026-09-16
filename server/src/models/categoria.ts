export interface Categoria {
  id: number;
  usuario_id: number;
  nombre: string;
  color: string | null;
  creado_en: Date;
  actualizado_en: Date;
}

export interface NuevaCategoria {
  usuario_id: number;
  nombre: string;
  color?: string | null;
}