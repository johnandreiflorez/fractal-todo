export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const noAutorizado = (message = 'No autorizado') => new HttpError(401, message);
export const noEncontrado = (message = 'Recurso no encontrado') => new HttpError(404, message);
export const conflicto = (message: string) => new HttpError(409, message);