import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Aula, ConcluirAulaResponse } from '../types/api';

export function useCriarAulaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { titulo: string; ordem: number }) =>
      apiFetch<Aula>(`/cursos/${cursoId}/aulas`, { method: 'POST', body: values }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] }),
  });
}

export function useExcluirAulaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aulaId: string) => apiFetch<void>(`/aulas/${aulaId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] }),
  });
}

export function useConcluirAulaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aulaId: string) => apiFetch<ConcluirAulaResponse>(`/aulas/${aulaId}/concluir`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] });
      queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
    },
  });
}
