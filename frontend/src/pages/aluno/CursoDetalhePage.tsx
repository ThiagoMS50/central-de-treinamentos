import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useCursoQuery } from '../../hooks/useCursos';
import { useConcluirAulaMutation } from '../../hooks/useAulas';
import { useQuizQuery } from '../../hooks/useQuiz';
import { baixarMaterial } from '../../hooks/useMateriais';
import { baixarCertificadoCurso } from '../../hooks/useCertificados';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge, PrazoBadge } from '../../components/ui/Badge';
import { QuizPratica } from '../../components/QuizPratica';
import { formatDate } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';
import type { Aula, CursoDetail } from '../../types/api';

type Step =
  | { kind: 'intro' }
  | { kind: 'aula'; aula: Aula; numero: number }
  | { kind: 'quiz' }
  | { kind: 'certificado' };

function montarSteps(curso: CursoDetail | undefined, ehAdmin: boolean): Step[] {
  if (!curso) return [{ kind: 'intro' }];
  return [
    { kind: 'intro' },
    ...curso.aulas.map((aula, i) => ({ kind: 'aula' as const, aula, numero: i + 1 })),
    ...(curso.temQuiz ? [{ kind: 'quiz' as const }] : []),
    ...(!ehAdmin && curso.status === 'concluido' ? [{ kind: 'certificado' as const }] : []),
  ];
}

export function CursoDetalhePage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();

  const cursoQuery = useCursoQuery(id);
  const curso = cursoQuery.data;
  const ehAdmin = profile?.role === 'admin';

  const quizQuery = useQuizQuery(id, !!curso?.temQuiz);
  const concluirAulaMutation = useConcluirAulaMutation(id!);

  const steps = montarSteps(curso, ehAdmin);
  const [stepIndex, setStepIndex] = useState(0);
  const statusAnteriorRef = useRef<string | undefined>(curso?.status);

  // Quando o curso passa a "concluido" (por concluir a última aula ou acertar o quiz, o que
  // fechar o círculo por último), pula automaticamente pro passo final de certificado.
  useEffect(() => {
    if (!curso) return;
    if (statusAnteriorRef.current !== 'concluido' && curso.status === 'concluido') {
      setStepIndex(montarSteps(curso, ehAdmin).length - 1);
    }
    statusAnteriorRef.current = curso.status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso?.status]);

  if (cursoQuery.isLoading) return <Spinner />;
  if (cursoQuery.isError) return <ErrorBanner onRetry={() => cursoQuery.refetch()} />;
  if (!curso) return null;

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="page">
      <Link to="/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <div className="page-header">
        <h1>{curso.titulo}</h1>
        {!ehAdmin && (
          <div className="card-badges">
            <StatusBadge status={curso.status} />
            <PrazoBadge prazoStatus={curso.prazoStatus} />
          </div>
        )}
      </div>

      <div className="wizard">
        <div className="wizard-content">
          {step.kind === 'intro' && (
            <div className="wizard-step">
              <h2>{t('curso.about')}</h2>
              {curso.descricao && <p>{curso.descricao}</p>}
              <div className="curso-meta">
                <span>
                  {t('curso.cargaHoraria')}: {curso.cargaHorariaHoras} {t('common.hours')}
                </span>
                {!ehAdmin && curso.prazoEm && (
                  <span>
                    {t('curso.deadline')}: {formatDate(curso.prazoEm, i18n.language)}
                  </span>
                )}
              </div>
              {curso.aulas.length === 0 && <EmptyState message={t('curso.noAulas')} />}
            </div>
          )}

          {step.kind === 'aula' && (
            <div className="wizard-step">
              <div className="aula-card-header">
                <h2>
                  {step.numero}. {step.aula.titulo}
                </h2>
                {!ehAdmin && step.aula.concluida && <span className="badge badge-success">{t('curso.aulaCompleted')}</span>}
              </div>

              {step.aula.materiais.length === 0 && <EmptyState message={t('curso.noMaterials')} />}
              {step.aula.materiais.length > 0 && (
                <ul className="material-list">
                  {step.aula.materiais.map((material) => (
                    <li key={material.id}>
                      <span>{material.titulo}</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => baixarMaterial(step.aula.id, material.id)}
                      >
                        {t('curso.downloadMaterial')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!ehAdmin && !step.aula.concluida && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={concluirAulaMutation.isPending}
                  onClick={() => concluirAulaMutation.mutate(step.aula.id)}
                >
                  {t('curso.markAulaComplete')}
                </button>
              )}
            </div>
          )}

          {step.kind === 'quiz' && (
            <div className="wizard-step">
              {quizQuery.isLoading && <Spinner />}
              {quizQuery.data && <QuizPratica cursoId={curso.id} quiz={quizQuery.data} />}
            </div>
          )}

          {step.kind === 'certificado' && (
            <div className="wizard-step">
              <h2>{t('curso.completedTitle')}</h2>
              <p>{t('curso.completedMessage')}</p>
              <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoCurso(curso.id, curso.titulo)}>
                {t('curso.downloadCertificate')}
              </button>
            </div>
          )}
        </div>

        <div className="wizard-nav">
          <button type="button" className="btn btn-secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((s) => s - 1)}>
            ← {t('curso.prevStep')}
          </button>
          <span className="wizard-progress">{t('curso.stepOf', { current: stepIndex + 1, total: steps.length })}</span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={stepIndex >= steps.length - 1}
            onClick={() => setStepIndex((s) => s + 1)}
          >
            {t('curso.nextStep')} →
          </button>
        </div>
      </div>
    </div>
  );
}
