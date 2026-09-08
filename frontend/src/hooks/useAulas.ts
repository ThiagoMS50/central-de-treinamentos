import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Aula, ConcluirAulaResponse } from '../types/api';

export function useCriarAulaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { titulo: string; ordem: number; videoUrl?: string | null }) =>
      apiFetch<Aula>(`/cursos/${cursoId}/aulas`, { method: 'POST', body: values }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] }),
  });
}

// O PUT substitui a aula inteira (título+ordem+vídeo) a partir do corpo enviado — não é um patch
// parcial. Por isso videoUrl precisa ser sempre enviado (mesmo quando só o título/ordem estão
// mudando), senão renomear ou reordenar uma aula apaga o vídeo dela sem querer.
export function useAtualizarAulaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ aulaId, titulo, ordem, videoUrl }: { aulaId: string; titulo: string; ordem: number; videoUrl: string | null }) =>
      apiFetch<Aula>(`/aulas/${aulaId}`, { method: 'PUT', body: { titulo, ordem, videoUrl } }),
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
      // refetchQueries (em vez de só invalidate) força a busca imediata dessa querie especifica,
      // sem esperar o próximo momento em que o React Query decidiria refazer sozinho — é o que
      // atualiza curso.status logo após concluir a aula, disparando o avanço automático pro
      // certificado quando essa era a última pendência.
      queryClient.refetchQueries({ queryKey: ['cursos', cursoId] });
      queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
    },
  });
}
