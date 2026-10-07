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
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Icon, type IconName } from '../../components/ui/Icon';
import { QuizPratica } from '../../components/QuizPratica';
import { formatDate } from '../../lib/format';
import { resolveVideoEmbed } from '../../lib/video';
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

// Até onde o aluno pode navegar pelo índice lateral: até a primeira aula ainda não concluída
// (as aulas são concluídas em ordem, pelo botão Avançar). O Admin revisa e navega livremente.
function ultimoPassoLiberado(steps: Step[], ehAdmin: boolean) {
  if (ehAdmin) return steps.length - 1;
  const primeiraPendente = steps.findIndex((s) => s.kind === 'aula' && !s.aula.concluida);
  return primeiraPendente === -1 ? steps.length - 1 : primeiraPendente;
}

const STEP_ICON: Record<Step['kind'], IconName> = {
  intro: 'info',
  aula: 'play',
  quiz: 'quiz',
  certificado: 'certificate',
};

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

  const indiceAtual = Math.min(stepIndex, steps.length - 1);
  const step = steps[indiceAtual];
  const liberadoAte = ultimoPassoLiberado(steps, ehAdmin);
  const aulasConcluidas = curso.aulas.filter((a) => a.concluida).length;
  const percentAulas = curso.aulas.length ? Math.round((aulasConcluidas / curso.aulas.length) * 100) : 0;

  const noUltimoPasso = indiceAtual >= steps.length - 1;
  // Curso sem quiz: ao chegar na última aula, "Avançar" vira "Concluir" e a própria navegação
  // marca a aula (e, com isso, o curso inteiro) como concluída — sem botão separado.
  const eBotaoConcluirCurso = !ehAdmin && step.kind === 'aula' && !step.aula.concluida && noUltimoPasso && !curso.temQuiz;
  const podeAvancar = !noUltimoPasso || eBotaoConcluirCurso;

  function handleAvancar() {
    if (!ehAdmin && step.kind === 'aula' && !step.aula.concluida) {
      concluirAulaMutation.mutate(step.aula.id, {
        // Se essa aula fechou o curso (última aula sem quiz, ou já com quiz respondido antes),
        // o efeito que observa curso.status cuida de pular pro passo de certificado sozinho.
        onSuccess: (res) => {
          if (!res.cursoConcluido) setStepIndex(indiceAtual + 1);
        },
      });
      return;
    }
    setStepIndex(indiceAtual + 1);
  }

  function rotuloStep(s: Step) {
    if (s.kind === 'intro') return t('curso.intro');
    if (s.kind === 'aula') return `${s.numero}. ${s.aula.titulo}`;
    if (s.kind === 'quiz') return t('curso.quiz');
    return t('curso.certificate');
  }

  return (
    <div className="page">
      <Link to="/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <header className="detalhe-header">
        <div className="detalhe-header-texto">
          <h1>{curso.titulo}</h1>
          <div className="meta-chips">
            <span className="meta-chip">
              <Icon name="clock" size={15} />
              {curso.cargaHorariaHoras} {t('common.hours')}
            </span>
            <span className="meta-chip">
              <Icon name="book" size={15} />
              {t('curso.lessons', { count: curso.aulas.length })}
            </span>
            {!ehAdmin && curso.prazoEm && (
              <span className="meta-chip">
                <Icon name="calendar" size={15} />
                {t('curso.deadline')}: {formatDate(curso.prazoEm, i18n.language)}
              </span>
            )}
            {!ehAdmin && <StatusBadge status={curso.status} />}
            {!ehAdmin && <PrazoBadge prazoStatus={curso.prazoStatus} />}
          </div>
        </div>
        {!ehAdmin && curso.aulas.length > 0 && (
          <div className="detalhe-progresso">
            <span className="detalhe-progresso-label">
              {t('curso.lessonsProgress', { done: aulasConcluidas, total: curso.aulas.length })}
            </span>
            <ProgressBar percent={percentAulas} />
          </div>
        )}
      </header>

      <div className="curso-layout">
        <aside className="curso-indice" aria-label={t('curso.content')} data-tour="indice">
          <h2 className="curso-indice-titulo">{t('curso.content')}</h2>
          <ol className="step-list">
            {steps.map((s, i) => {
              const bloqueado = i > liberadoAte;
              const concluido =
                !ehAdmin &&
                ((s.kind === 'aula' && s.aula.concluida) ||
                  (s.kind === 'quiz' && curso.status === 'concluido') ||
                  (s.kind === 'intro' && i < liberadoAte));
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`step-item${i === indiceAtual ? ' step-item-atual' : ''}${concluido ? ' step-item-ok' : ''}`}
                    disabled={bloqueado}
                    aria-current={i === indiceAtual ? 'step' : undefined}
                    title={bloqueado ? t('curso.lockedStep') : undefined}
                    onClick={() => setStepIndex(i)}
                  >
                    <span className="step-indicador" aria-hidden="true">
                      <Icon name={bloqueado ? 'lock' : concluido ? 'check' : STEP_ICON[s.kind]} size={14} />
                    </span>
                    <span className="step-rotulo">{rotuloStep(s)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="wizard">
          <div className="wizard-content">
            {step.kind === 'intro' && (
              <div className="wizard-step">
                <h2>{t('curso.about')}</h2>
                {curso.descricao ? <p className="curso-descricao">{curso.descricao}</p> : null}
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

                {step.aula.videoUrl && <AulaVideoPlayer videoUrl={step.aula.videoUrl} titulo={step.aula.titulo} />}

                <h3 className="wizard-subtitulo">{t('curso.materials')}</h3>
                {step.aula.materiais.length === 0 && <EmptyState message={t('curso.noMaterials')} />}
                {step.aula.materiais.length > 0 && (
                  <ul className="material-list">
                    {step.aula.materiais.map((material) => (
                      <li key={material.id}>
                        <span className="material-icone" aria-hidden="true">
                          <Icon name="file" size={18} />
                        </span>
                        <span className="material-titulo">{material.titulo}</span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => baixarMaterial(step.aula.id, material.id)}
                        >
                          <Icon name="download" size={14} />
                          {t('curso.downloadMaterial')}
                        </button>
                      </li>
                    ))}
                  </ul>
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
              <div className="wizard-step certificado-step">
                <span className="certificado-icone" aria-hidden="true">
                  <Icon name="certificate" size={32} />
                </span>
                <h2>{t('curso.completedTitle')}</h2>
                <p>{t('curso.completedMessage')}</p>
                <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoCurso(curso.id, curso.titulo)}>
                  <Icon name="download" size={16} />
                  {t('curso.downloadCertificate')}
                </button>
              </div>
            )}
          </div>

          <div className="wizard-nav">
            <button type="button" className="btn btn-secondary" disabled={indiceAtual === 0} onClick={() => setStepIndex(indiceAtual - 1)}>
              ← {t('curso.prevStep')}
            </button>
            <span className="wizard-progress">{t('curso.stepOf', { current: indiceAtual + 1, total: steps.length })}</span>
            <button
              type="button"
              className={eBotaoConcluirCurso || (!noUltimoPasso && !ehAdmin) ? 'btn btn-primary' : 'btn btn-secondary'}
              disabled={!podeAvancar || concluirAulaMutation.isPending}
              onClick={handleAvancar}
              data-tour="avancar"
            >
              {eBotaoConcluirCurso ? t('curso.concluirCurso') : `${t('curso.nextStep')} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AulaVideoPlayer({ videoUrl, titulo }: { videoUrl: string; titulo: string }) {
  const embed = resolveVideoEmbed(videoUrl);
  if (!embed) return null;

  return (
    <div className="aula-video-wrapper">
      {embed.kind === 'file' ? (
        <video controls src={embed.src} />
      ) : (
        <iframe src={embed.embedUrl} title={titulo} allowFullScreen />
      )}
    </div>
  );
}
