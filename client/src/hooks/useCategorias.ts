import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as categoriasService from '../servicios/categorias.service.js';
import type { Categoria, Tarea } from '../tipos/index.js';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.listarCategorias,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.crearCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number;
      datos: { nombre?: string; color?: string | null };
    }) => categoriasService.actualizarCategoria(id, datos),
    onMutate: async ({ id, datos }) => {
      await queryClient.cancelQueries({ queryKey: ['categorias'] });
      const previoCategorias = queryClient.getQueryData<Categoria[]>(['categorias']);
      const previoTareas = queryClient.getQueriesData<Tarea[]>({ queryKey: ['tareas'] });

      queryClient.setQueryData<Categoria[]>(['categorias'], (previas) =>
        previas?.map((categoria) =>
          categoria.id === id
            ? {
                ...categoria,
                ...(datos.nombre !== undefined ? { nombre: datos.nombre } : {}),
                ...(datos.color !== undefined ? { color: datos.color } : {}),
              }
            : categoria,
        ),
      );

      queryClient.setQueriesData<Tarea[]>({ queryKey: ['tareas'] }, (previas) =>
        previas?.map((tarea) =>
          tarea.categoria_id === id
            ? {
                ...tarea,
                ...(datos.nombre !== undefined ? { categoria_nombre: datos.nombre } : {}),
                ...(datos.color !== undefined ? { categoria_color: datos.color } : {}),
              }
            : tarea,
        ),
      );

      return { previoCategorias, previoTareas };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        queryClient.setQueryData(['categorias'], contexto.previoCategorias);
        for (const [clave, datos] of contexto.previoTareas) {
          queryClient.setQueryData(clave, datos);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasService.eliminarCategoria(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categorias'] });
      const previo = queryClient.getQueryData<Categoria[]>(['categorias']);
      queryClient.setQueryData<Categoria[]>(['categorias'], (previas) =>
        previas?.filter((categoria) => categoria.id !== id),
      );
      return { previo };
    },
    onError: (_error, _variables, contexto) => {
      if (contexto) {
        queryClient.setQueryData(['categorias'], contexto.previo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}