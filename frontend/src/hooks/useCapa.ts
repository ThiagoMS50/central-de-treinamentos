import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';

export type TipoCapa = 'cursos' | 'trilhas';

// Imagem da galeria de capas prontas. nome = arquivo (ex.: "seguranca.webp").
export interface CapaGaleriaItem {
  nome: string;
  url: string;
}

export function useGaleriaCapasQuery(habilitado: boolean) {
  return useQuery({
    queryKey: ['capas', 'galeria'],
    queryFn: () => apiFetch<CapaGaleriaItem[]>('/capas/galeria'),
    enabled: habilitado,
    staleTime: 10 * 60 * 1000,
  });
}

// Envia/escolhe/remove a capa de um curso ou trilha. Depois recarrega as listas e o detalhe,
// já que a capa aparece no painel, na trilha (cursos dela) e no próprio cadastro.
export function useCapaMutations(tipo: TipoCapa) {
  const queryClient = useQueryClient();
  const recarregar = () => {
    queryClient.invalidateQueries({ queryKey: ['cursos'] });
    queryClient.invalidateQueries({ queryKey: ['trilhas'] });
  };

  const enviar = useMutation({
    mutationFn: ({ id, arquivo }: { id: string; arquivo: Blob }) => {
      const form = new FormData();
      const extensao = arquivo.type.split('/')[1] ?? 'jpg';
      form.append('arquivo', arquivo, `capa.${extensao}`);
      return apiFetch<{ capaUrl: string | null }>(`/${tipo}/${id}/capa`, { method: 'POST', body: form });
    },
    onSuccess: recarregar,
  });

  const escolherGaleria = useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) =>
      apiFetch<{ capaUrl: string | null }>(`/${tipo}/${id}/capa/galeria`, { method: 'PUT', body: { nome } }),
    onSuccess: recarregar,
  });

  const remover = useMutation({
    mutationFn: (id: string) => apiFetch<{ capaUrl: string | null }>(`/${tipo}/${id}/capa`, { method: 'DELETE' }),
    onSuccess: recarregar,
  });

  return {
    enviar,
    escolherGaleria,
    remover,
    ocupado: enviar.isPending || escolherGaleria.isPending || remover.isPending,
  };
}
