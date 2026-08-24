import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useCursoQuery, useConcluirCursoMutation } from '../../hooks/useCursos';
import { useQuizQuery } from '../../hooks/useQuiz';
import { baixarMaterial } from '../../hooks/useMateriais';
import { baixarCertificadoCurso } from '../../hooks/useCertificados';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge, PrazoBadge } from '../../components/ui/Badge';
import { QuizPratica } from '../../components/QuizPratica';
import { formatDate } from '../../lib/format';

export function CursoDetalhePage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const cursoQuery = useCursoQuery(id);
  const quizQuery = useQuizQuery(id, !!cursoQuery.data?.temQuiz);
  const concluirMutation = useConcluirCursoMutation(id!);

  if (cursoQuery.isLoading) return <Spinner />;
  if (cursoQuery.isError) return <ErrorBanner onRetry={() => cursoQuery.refetch()} />;
  if (!cursoQuery.data) return null;

  const curso = cursoQuery.data;

  return (
    <div className="page">
      <Link to="/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <div className="page-header">
        <h1>{curso.titulo}</h1>
        <div className="card-badges">
          <StatusBadge status={curso.status} />
          <PrazoBadge prazoStatus={curso.prazoStatus} />
        </div>
      </div>

      {curso.descricao && <p>{curso.descricao}</p>}

      <div className="curso-meta">
        <span>
          {t('curso.cargaHoraria')}: {curso.cargaHorariaHoras} {t('common.hours')}
        </span>
        {curso.prazoEm && (
          <span>
            {t('curso.deadline')}: {formatDate(curso.prazoEm, i18n.language)}
          </span>
        )}
      </div>

      <section>
        <h2>{t('curso.materiais')}</h2>
        {curso.materiais.length === 0 && <EmptyState message={t('curso.noMaterials')} />}
        {curso.materiais.length > 0 && (
          <ul className="material-list">
            {curso.materiais.map((material) => (
              <li key={material.id}>
                <span>{material.titulo}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => baixarMaterial(curso.id, material.id)}
                >
                  {t('curso.downloadMaterial')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {curso.temQuiz && (
        <section>
          {quizQuery.isLoading && <Spinner />}
          {quizQuery.data && <QuizPratica cursoId={curso.id} quiz={quizQuery.data} />}
        </section>
      )}

      <section className="curso-actions">
        {curso.status !== 'concluido' ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={concluirMutation.isPending}
            onClick={() => concluirMutation.mutate()}
          >
            {t('curso.markComplete')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoCurso(curso.id, curso.titulo)}>
            {t('curso.downloadCertificate')}
          </button>
        )}
      </section>
    </div>
  );
}
