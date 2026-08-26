import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Configuracoes } from '../types/api';

export function useConfiguracoesQuery() {
  return useQuery({ queryKey: ['configuracoes'], queryFn: () => apiFetch<Configuracoes>('/configuracoes') });
}

export function useAtualizarConfiguracoesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rankingHabilitado: boolean) =>
      apiFetch<Configuracoes>('/configuracoes', { method: 'PUT', body: { rankingHabilitado } }),
    onSuccess: (data) => queryClient.setQueryData(['configuracoes'], data),
  });
}
