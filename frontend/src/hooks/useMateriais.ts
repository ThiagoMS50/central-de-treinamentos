import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Material } from '../types/api';

export function useUploadMaterialMutation(cursoId: string, aulaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titulo, ordem, arquivo }: { titulo: string; ordem: number; arquivo: File }) => {
      const form = new FormData();
      form.append('titulo', titulo);
      form.append('ordem', String(ordem));
      form.append('arquivo', arquivo);
      return apiFetch<Material>(`/aulas/${aulaId}/materiais`, { method: 'POST', body: form });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] }),
  });
}

export function useExcluirMaterialMutation(cursoId: string, aulaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => apiFetch<void>(`/aulas/${aulaId}/materiais/${materialId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] }),
  });
}

export async function baixarMaterial(aulaId: string, materialId: string) {
  const { url } = await apiFetch<{ url: string }>(`/aulas/${aulaId}/materiais/${materialId}/download`);
  window.open(url, '_blank', 'noopener');
}
