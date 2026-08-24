import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { TrilhaDetail, TrilhaListItem } from '../types/api';

export interface TrilhaFormValues {
  titulo: string;
  descricao: string;
}

export function useTrilhasQuery() {
  return useQuery({ queryKey: ['trilhas'], queryFn: () => apiFetch<TrilhaListItem[]>('/trilhas') });
}

export function useTrilhaQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['trilhas', id],
    queryFn: () => apiFetch<TrilhaDetail>(`/trilhas/${id}`),
    enabled: !!id,
  });
}

export function useCriarTrilhaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TrilhaFormValues) => apiFetch<TrilhaListItem>('/trilhas', { method: 'POST', body: values }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trilhas'] }),
  });
}

export function useAtualizarTrilhaMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TrilhaFormValues) => apiFetch<TrilhaListItem>(`/trilhas/${id}`, { method: 'PUT', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      queryClient.invalidateQueries({ queryKey: ['trilhas', id] });
    },
  });
}

export function useExcluirTrilhaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/trilhas/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trilhas'] }),
  });
}
