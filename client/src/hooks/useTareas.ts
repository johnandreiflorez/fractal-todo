import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tareasService from '../servicios/tareas.service.js';
import type { CambiosLote, FiltrosTareas, NuevaTarea, Tarea } from '../tipos/index.js';

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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}

export function useEliminarTareasEnLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => tareasService.eliminarTareasEnLote(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      queryClient.invalidateQueries({ queryKey: ['etiquetas'] });
    },
  });
}