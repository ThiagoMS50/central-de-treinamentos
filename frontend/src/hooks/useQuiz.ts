import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/apiClient';
import type { Quiz } from '../types/api';

export interface QuizFormAlternativa {
  texto: string;
  correta: boolean;
  ordem: number;
}

export interface QuizFormPergunta {
  enunciado: string;
  ordem: number;
  alternativas: QuizFormAlternativa[];
}

export interface QuizFormValues {
  titulo: string;
  perguntas: QuizFormPergunta[];
}

export function useQuizQuery(cursoId: string | undefined, habilitado: boolean) {
  return useQuery({
    queryKey: ['quiz', cursoId],
    queryFn: async () => {
      try {
        return await apiFetch<Quiz>(`/cursos/${cursoId}/quiz`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!cursoId && habilitado,
  });
}

export function useSalvarQuizMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: QuizFormValues) => apiFetch<Quiz>(`/cursos/${cursoId}/quiz`, { method: 'PUT', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', cursoId] });
      queryClient.invalidateQueries({ queryKey: ['cursos', cursoId] });
    },
  });
}

export function useResponderPerguntaMutation(cursoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ perguntaId, alternativaId }: { perguntaId: string; alternativaId: string }) =>
      apiFetch<{ correta: boolean; alternativaCorretaId: string; cursoConcluido: boolean }>(
        `/cursos/${cursoId}/quiz/responder/${perguntaId}`,
        { method: 'POST', body: { alternativaId } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', cursoId] });
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      // refetchQueries força a busca imediata do curso (não só marca como desatualizado) — é o
      // que atualiza curso.status assim que a última pergunta é respondida certa, disparando o
      // avanço automático pro passo de certificado.
      queryClient.refetchQueries({ queryKey: ['cursos', cursoId] });
      queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
    },
  });
}
