import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as categoriasService from '../servicios/categorias.service.js';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasService.eliminarCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });
}