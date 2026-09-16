let contador = 0;

export function emailUnico(prefijo = 'usuario'): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}@test.local`;
}