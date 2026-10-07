import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Profile, Role } from '../types/api';

export function useUsuariosQuery() {
  return useQuery({ queryKey: ['usuarios'], queryFn: () => apiFetch<Profile[]>('/perfis') });
}

export function useAtualizarUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      apiFetch<Profile>(`/perfis/${id}`, { method: 'PUT', body: { role } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useExcluirUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/perfis/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
