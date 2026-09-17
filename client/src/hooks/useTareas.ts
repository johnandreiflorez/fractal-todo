import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tareasService from '../servicios/tareas.service.js';
import type {
  CambiosLote,
  Categoria,
  FiltrosTareas,
  NuevaTarea,
  Prioridad,
  Tarea,
} from '../tipos/index.js';

function esPrioridad(valor: number): valor is Prioridad {
  return Number.isInteger(valor) && valor >= 1 && valor <= 5;
}

function categoriaDe(
  categoriaId: number | null | undefined,
  categorias: Categoria[] | undefined,
): Categoria | undefined {
  return categoriaId != null
    ? categorias?.find((categoria) => categoria.id === categoriaId)
    : undefined;
}

function aplicarCambiosATarea(
  tarea: Tarea,
  datos: NuevaTarea,
  categorias: Categoria[] | undefined,
): Tarea {
  const categoria = categoriaDe(datos.categoria_id, categorias);
  return {
    ...tarea,
    titulo: datos.titulo,
    descripcion: datos.descripcion ?? null,
    etiquetas: datos.etiquetas ?? tarea.etiquetas,
    ...(datos.prioridad !== undefined && esPrioridad(datos.prioridad)
      ? { prioridad: datos.prioridad }
      : {}),
    ...(datos.categoria_id !== undefined
      ? {
          categoria_id: datos.categoria_id ?? null,
          categoria_nombre: categoria?.nombre ?? null,
          categoria_color: categoria?.color ?? null,
        }
      : {}),
    ...(datos.fecha_vencimiento !== undefined
      ? { fecha_vencimiento: datos.fecha_vencimiento ?? null }
      : {}),
  };
}

function aplicarCambiosLote(
  tarea: Tarea,
  cambios: CambiosLote,
  categorias: Categoria[] | undefined,
): Tarea {
  const categoria = categoriaDe(cambios.categoria_id, categorias);
  return {
    ...tarea,
    ...(cambios.completada !== undefined ? { completada: cambios.completada } : {}),
    ...(cambios.prioridad !== undefined && esPrioridad(cambios.prioridad)
      ? { prioridad: cambios.prioridad }
      : {}),
    ...(cambios.etiquetas !== undefined ? { etiquetas: cambios.etiquetas } : {}),
    ...(cambios.categoria_id !== undefined
      ? {
          categoria_id: cambios.categoria_id ?? null,
          categoria_nombre: categoria?.nombre ?? null,
          categoria_color: categoria?.color ?? null,
        }
      : {}),
  };
}

export function useTareas(filtros: FiltrosTareas) {
  return useQuery({
    queryKey: ['tareas', filtros],
    queryFn: () => tareasService.listarTareas(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useCrearTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: NuevaTarea) => tareasService.crearTarea(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}

export function useActualizarTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: NuevaTarea }) =>
      tareasService.actualizarTarea(id, datos),
    onMutate: async ({ id, datos }) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });
      const previo = queryClient.getQueriesData<Tarea[]>({ queryKey: ['tareas'] });
      const categorias = queryClient.getQueryData<Categoria[]>(['categorias']);
      queryClient.setQueriesData<Tarea[]>({ queryKey: ['tareas'] }, (previas) =>
        previas?.map((tarea) =>
          tarea.id === id ? aplicarCambiosATarea(tarea, datos, categorias) : tarea,
        ),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        for (const [clave, datos] of contexto.previo) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}

export function useCompletarTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completada }: { id: number; completada: boolean }) =>
      tareasService.completarTarea(id, completada),
    onMutate: async ({ id, completada }) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });
      const previo = queryClient.getQueriesData({ queryKey: ['tareas'] });
      queryClient.setQueriesData<Tarea[]>(
        { queryKey: ['tareas'] },
        (previas) =>
          previas?.map((tarea) =>
            tarea.id === id ? { ...tarea, completada } : tarea,
          ),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        for (const [clave, datos] of contexto.previo) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}

export function useEliminarTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tareasService.eliminarTarea(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });
      const previo = queryClient.getQueriesData({ queryKey: ['tareas'] });
      queryClient.setQueriesData<Tarea[]>({ queryKey: ['tareas'] }, (previas) =>
        previas?.filter((tarea) => tarea.id !== id),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        for (const [clave, datos] of contexto.previo) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}

export function useActualizarTareasEnLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, cambios }: { ids: number[]; cambios: CambiosLote }) =>
      tareasService.actualizarTareasEnLote(ids, cambios),
    onMutate: async ({ ids, cambios }) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });
      const previo = queryClient.getQueriesData<Tarea[]>({ queryKey: ['tareas'] });
      const categorias = queryClient.getQueryData<Categoria[]>(['categorias']);
      const conjunto = new Set(ids);
      queryClient.setQueriesData<Tarea[]>({ queryKey: ['tareas'] }, (previas) =>
        previas?.map((tarea) =>
          conjunto.has(tarea.id)
            ? aplicarCambiosLote(tarea, cambios, categorias)
            : tarea,
        ),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        for (const [clave, datos] of contexto.previo) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}

export function useEliminarTareasEnLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => tareasService.eliminarTareasEnLote(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });
      const previo = queryClient.getQueriesData<Tarea[]>({ queryKey: ['tareas'] });
      const conjunto = new Set(ids);
      queryClient.setQueriesData<Tarea[]>({ queryKey: ['tareas'] }, (previas) =>
        previas?.filter((tarea) => !conjunto.has(tarea.id)),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        for (const [clave, datos] of contexto.previo) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}