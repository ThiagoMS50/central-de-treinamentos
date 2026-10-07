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

// Admin pede para a pessoa ver o tutorial de novo na próxima vez que entrar.
export function useRedefinirTutorialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Profile>(`/perfis/${id}/tutorial/redefinir`, { method: 'POST' }),
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
