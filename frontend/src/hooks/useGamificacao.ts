import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { DetalheParticipante, MeuProgressoGamificacao, RankingItem } from '../types/api';

export function useMeuProgressoGamificacaoQuery() {
  return useQuery({ queryKey: ['gamificacao', 'me'], queryFn: () => apiFetch<MeuProgressoGamificacao>('/gamificacao/me') });
}

export function useRankingQuery() {
  return useQuery({ queryKey: ['gamificacao', 'ranking'], queryFn: () => apiFetch<RankingItem[]>('/gamificacao/ranking') });
}

export function useDetalheParticipanteQuery(alunoId: string | null) {
  return useQuery({
    queryKey: ['gamificacao', 'participante', alunoId],
    queryFn: () => apiFetch<DetalheParticipante>(`/gamificacao/participante/${alunoId}`),
    enabled: !!alunoId,
  });
}
