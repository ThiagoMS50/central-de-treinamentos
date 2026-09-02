import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuizQuery, useSalvarQuizMutation, type QuizFormPergunta } from '../../hooks/useQuiz';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';
import { ConfirmDialog } from '../ui/ConfirmDialog';

function novaPergunta(ordem: number): QuizFormPergunta {
  return {
    enunciado: '',
    ordem,
    alternativas: [
      { texto: '', correta: true, ordem: 0 },
      { texto: '', correta: false, ordem: 1 },
    ],
  };
}

export function QuizBuilder({ cursoId }: { cursoId: string }) {
  const { t } = useTranslation();
  const quizQuery = useQuizQuery(cursoId, true);
  const salvarMutation = useSalvarQuizMutation(cursoId);
  const { salvo, mostrar } = useSavedFeedback();

  const [titulo, setTitulo] = useState('Quiz de prática');
  const [perguntas, setPerguntas] = useState<QuizFormPergunta[]>([]);
  const [perguntaParaExcluir, setPerguntaParaExcluir] = useState<number | null>(null);

  useEffect(() => {
    if (!quizQuery.data) return;
    setTitulo(quizQuery.data.titulo);
    setPerguntas(
      quizQuery.data.perguntas.map((p) => ({
        enunciado: p.enunciado,
        ordem: p.ordem,
        alternativas: p.alternativas.map((a) => ({ texto: a.texto, correta: !!a.correta, ordem: a.ordem })),
      })),
    );
  }, [quizQuery.data]);

  function atualizarPergunta(index: number, patch: Partial<QuizFormPergunta>) {
    setPerguntas((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function atualizarAlternativa(perguntaIndex: number, altIndex: number, texto: string) {
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i !== perguntaIndex
          ? p
          : { ...p, alternativas: p.alternativas.map((a, j) => (j === altIndex ? { ...a, texto } : a)) },
      ),
    );
  }

  function marcarCorreta(perguntaIndex: number, altIndex: number) {
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i !== perguntaIndex
          ? p
          : { ...p, alternativas: p.alternativas.map((a, j) => ({ ...a, correta: j === altIndex })) },
      ),
    );
  }

  function adicionarAlternativa(perguntaIndex: number) {
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i !== perguntaIndex
          ? p
          : { ...p, alternativas: [...p.alternativas, { texto: '', correta: false, ordem: p.alternativas.length }] },
      ),
    );
  }

  function removerAlternativa(perguntaIndex: number, altIndex: number) {
    setPerguntas((prev) =>
      prev.map((p, i) => {
        if (i !== perguntaIndex) return p;
        const restantes = p.alternativas.filter((_, j) => j !== altIndex);
        // se a alternativa correta era a removida, marca a primeira restante pra não ficar
        // um quiz sem resposta certa nenhuma.
        if (restantes.length > 0 && !restantes.some((a) => a.correta)) restantes[0] = { ...restantes[0], correta: true };
        return { ...p, alternativas: restantes };
      }),
    );
  }

  function removerPergunta(index: number) {
    setPerguntas((prev) => prev.filter((_, i) => i !== index));
  }

  function adicionarPergunta() {
    setPerguntas((prev) => [...prev, novaPergunta(prev.length)]);
  }

  function handleSalvar() {
    salvarMutation.mutate({ titulo, perguntas }, { onSuccess: mostrar });
  }

  return (
    <div className="quiz-builder">
      <label>
        {t('admin.cursos.quizBuilder')}
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>

      {perguntas.map((pergunta, pIndex) => (
        <fieldset key={pIndex} className="quiz-question-editor">
          <legend>
            {t('admin.cursos.question')} {pIndex + 1}
          </legend>
          <input
            placeholder={t('admin.cursos.question')}
            value={pergunta.enunciado}
            onChange={(e) => atualizarPergunta(pIndex, { enunciado: e.target.value })}
          />

          {pergunta.alternativas.map((alt, aIndex) => (
            <div key={aIndex} className="quiz-option-editor">
              <input
                type="radio"
                name={`correta-${pIndex}`}
                checked={alt.correta}
                onChange={() => marcarCorreta(pIndex, aIndex)}
                title={t('admin.cursos.correctAnswer')}
              />
              <input
                placeholder={`${t('admin.cursos.alternative')} ${aIndex + 1}`}
                value={alt.texto}
                onChange={(e) => atualizarAlternativa(pIndex, aIndex, e.target.value)}
              />
              {pergunta.alternativas.length > 2 && (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => removerAlternativa(pIndex, aIndex)}
                  aria-label={t('common.delete')}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => adicionarAlternativa(pIndex)}>
            {t('admin.cursos.addAlternative')}
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setPerguntaParaExcluir(pIndex)}>
            {t('common.delete')}
          </button>
        </fieldset>
      ))}

      <button type="button" className="btn btn-secondary" onClick={adicionarPergunta}>
        {t('admin.cursos.addQuestion')}
      </button>

      <div className="form-inline">
        <button type="button" className="btn btn-primary" disabled={salvarMutation.isPending} onClick={handleSalvar}>
          {t('admin.cursos.saveQuiz')}
        </button>
        {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
      </div>

      {perguntaParaExcluir !== null && (
        <ConfirmDialog
          title={t('common.delete')}
          message={t('common.confirmDelete')}
          onConfirm={() => {
            removerPergunta(perguntaParaExcluir);
            setPerguntaParaExcluir(null);
          }}
          onCancel={() => setPerguntaParaExcluir(null)}
        />
      )}
    </div>
  );
}
