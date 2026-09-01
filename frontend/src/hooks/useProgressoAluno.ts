import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { ProgressoCurso } from '../types/api';

export function useProgressoAlunoQuery(alunoId: string | null) {
  return useQuery({
    queryKey: ['perfis', alunoId, 'progresso'],
    queryFn: () => apiFetch<ProgressoCurso[]>(`/perfis/${alunoId}/progresso`),
    enabled: !!alunoId,
  });
}
