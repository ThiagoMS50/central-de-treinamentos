import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Quiz } from '../types/api';
import { useResponderPerguntaMutation } from '../hooks/useQuiz';

export function QuizPratica({ cursoId, quiz }: { cursoId: string; quiz: Quiz }) {
  const { t } = useTranslation();
  const responder = useResponderPerguntaMutation(cursoId);
  const [selecionadas, setSelecionadas] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});

  function handleSelecionar(perguntaId: string, alternativaId: string) {
    setSelecionadas((prev) => ({ ...prev, [perguntaId]: alternativaId }));
  }

  function handleResponder(perguntaId: string) {
    const alternativaId = selecionadas[perguntaId];
    if (!alternativaId) return;
    responder.mutate(
      { perguntaId, alternativaId },
      {
        onSuccess: (res) => setFeedback((prev) => ({ ...prev, [perguntaId]: res.correta })),
      },
    );
  }

  return (
    <div className="quiz">
      <h3>{quiz.titulo}</h3>
      {quiz.perguntas.map((pergunta) => {
        const respostaAtual = selecionadas[pergunta.id] ?? pergunta.minhaResposta ?? '';
        const resultado = feedback[pergunta.id];
        return (
          <fieldset key={pergunta.id} className="quiz-question">
            <legend>{pergunta.enunciado}</legend>
            {pergunta.alternativas.map((alt) => (
              <label key={alt.id} className="quiz-option">
                <input
                  type="radio"
                  name={`pergunta-${pergunta.id}`}
                  value={alt.id}
                  checked={respostaAtual === alt.id}
                  onChange={() => handleSelecionar(pergunta.id, alt.id)}
                />
                {alt.texto}
              </label>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!respostaAtual || responder.isPending}
              onClick={() => handleResponder(pergunta.id)}
            >
              {t('quiz.submit')}
            </button>
            {resultado !== undefined && (
              <span className={resultado ? 'quiz-feedback-correct' : 'quiz-feedback-incorrect'}>
                {resultado ? t('quiz.correct') : t('quiz.incorrect')}
              </span>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
