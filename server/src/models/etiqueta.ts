export interface Etiqueta {
  id: number;
  usuario_id: number;
  nombre: string;
  creado_en: Date;
}

export interface EtiquetaConNombre {
  id: number;
  nombre: string;
}

export interface NuevaEtiqueta {
  usuario_id: number;
  nombre: string;
}