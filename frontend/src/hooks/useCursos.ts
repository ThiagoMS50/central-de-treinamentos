import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { CursoDetail, CursoListItem } from '../types/api';

export interface CursoFormValues {
  titulo: string;
  descricao: string;
  cargaHorariaHoras: number;
  temPrazo: boolean;
  prazoDias: number | null;
}

export function useCursosQuery() {
  return useQuery({ queryKey: ['cursos'], queryFn: () => apiFetch<CursoListItem[]>('/cursos') });
}

export function useCursoQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['cursos', id],
    queryFn: () => apiFetch<CursoDetail>(`/cursos/${id}`),
    enabled: !!id,
  });
}

export function useCriarCursoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CursoFormValues) => apiFetch<CursoListItem>('/cursos', { method: 'POST', body: values }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos'] }),
  });
}

export function useAtualizarCursoMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CursoFormValues) => apiFetch<CursoListItem>(`/cursos/${id}`, { method: 'PUT', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos', id] });
    },
  });
}

export function useExcluirCursoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/cursos/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos'] }),
  });
}
