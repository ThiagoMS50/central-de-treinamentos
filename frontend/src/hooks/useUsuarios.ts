import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Profile, Role } from '../types/api';

export function useUsuariosQuery() {
  return useQuery({ queryKey: ['usuarios'], queryFn: () => apiFetch<Profile[]>('/perfis') });
}

export function useAtualizarUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, managerId }: { id: string; role: Role; managerId: string | null }) =>
      apiFetch<Profile>(`/perfis/${id}`, { method: 'PUT', body: { role, managerId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
