import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuizQuery, useSalvarQuizMutation, type QuizFormPergunta } from '../../hooks/useQuiz';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Icon } from '../ui/Icon';

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
      <label className="campo">
        <span className="campo-label">{t('admin.cursos.quizTitle')}</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>

      {perguntas.length === 0 ? (
        <p className="hint-text">{t('admin.cursos.noQuestions')}</p>
      ) : (
        <p className="hint-text">{t('admin.cursos.markCorrectHint')}</p>
      )}

      {perguntas.map((pergunta, pIndex) => (
        <section key={pIndex} className="pergunta-editor">
          <div className="pergunta-editor-header">
            <span className="pergunta-editor-titulo">
              {t('admin.cursos.question')} {pIndex + 1}
            </span>
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={() => setPerguntaParaExcluir(pIndex)}
              aria-label={t('common.delete')}
              title={t('common.delete')}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>

          <textarea
            rows={2}
            placeholder={t('admin.cursos.question')}
            value={pergunta.enunciado}
            onChange={(e) => atualizarPergunta(pIndex, { enunciado: e.target.value })}
          />

          <div className="alternativas-editor">
            {pergunta.alternativas.map((alt, aIndex) => (
              <div key={aIndex} className={`alternativa-editor${alt.correta ? ' alternativa-correta' : ''}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={alt.correta}
                  className="alternativa-marcador"
                  onClick={() => marcarCorreta(pIndex, aIndex)}
                  aria-label={t('admin.cursos.correctAnswer')}
                  title={t('admin.cursos.correctAnswer')}
                >
                  {alt.correta && <Icon name="check" size={13} />}
                </button>
                <input
                  placeholder={`${t('admin.cursos.alternative')} ${aIndex + 1}`}
                  value={alt.texto}
                  onChange={(e) => atualizarAlternativa(pIndex, aIndex, e.target.value)}
                />
                {alt.correta && <span className="badge badge-success">{t('admin.cursos.correctAnswer')}</span>}
                {pergunta.alternativas.length > 2 && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removerAlternativa(pIndex, aIndex)}
                    aria-label={t('common.remove')}
                    title={t('common.remove')}
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="btn-ghost" onClick={() => adicionarAlternativa(pIndex)}>
            <Icon name="plus" size={15} />
            {t('admin.cursos.addAlternative')}
          </button>
        </section>
      ))}

      <button type="button" className="add-dashed" onClick={adicionarPergunta}>
        <Icon name="plus" size={16} />
        {t('admin.cursos.addQuestion')}
      </button>

      <div className="form-card-footer form-card-footer-solto">
        <span className="hint-text">{t('admin.cursos.unsavedQuiz')}</span>
        {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
        <button type="button" className="btn btn-primary" disabled={salvarMutation.isPending} onClick={handleSalvar}>
          {t('admin.cursos.saveQuiz')}
        </button>
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
