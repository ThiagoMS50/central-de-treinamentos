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

export function CursoDetalhePage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();

  const cursoQuery = useCursoQuery(id);
  const quizQuery = useQuizQuery(id, !!cursoQuery.data?.temQuiz);
  const concluirAulaMutation = useConcluirAulaMutation(id!);

  if (cursoQuery.isLoading) return <Spinner />;
  if (cursoQuery.isError) return <ErrorBanner onRetry={() => cursoQuery.refetch()} />;
  if (!cursoQuery.data) return null;

  const curso = cursoQuery.data;
  // Administrador está aqui pra revisar o conteúdo, não pra estudar — sem status/prazo pessoal
  // nem ações de "concluir aula"/certificado, pelos mesmos motivos do painel principal.
  const ehAdmin = profile?.role === 'admin';

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

      <section>
        <h2>{t('curso.aulas')}</h2>
        {curso.aulas.length === 0 && <EmptyState message={t('curso.noAulas')} />}
        {curso.aulas.map((aula, index) => (
          <div key={aula.id} className="aula-card">
            <div className="aula-card-header">
              <h3>
                {index + 1}. {aula.titulo}
              </h3>
              {!ehAdmin && aula.concluida && <span className="badge badge-success">{t('curso.aulaCompleted')}</span>}
            </div>

            {aula.materiais.length === 0 && <EmptyState message={t('curso.noMaterials')} />}
            {aula.materiais.length > 0 && (
              <ul className="material-list">
                {aula.materiais.map((material) => (
                  <li key={material.id}>
                    <span>{material.titulo}</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => baixarMaterial(aula.id, material.id)}
                    >
                      {t('curso.downloadMaterial')}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!ehAdmin && !aula.concluida && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={concluirAulaMutation.isPending}
                onClick={() => concluirAulaMutation.mutate(aula.id)}
              >
                {t('curso.markAulaComplete')}
              </button>
            )}
          </div>
        ))}
      </section>

      {curso.temQuiz && (
        <section>
          {quizQuery.isLoading && <Spinner />}
          {quizQuery.data && <QuizPratica cursoId={curso.id} quiz={quizQuery.data} />}
        </section>
      )}

      {!ehAdmin && curso.status === 'concluido' && (
        <section className="curso-actions">
          <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoCurso(curso.id, curso.titulo)}>
            {t('curso.downloadCertificate')}
          </button>
        </section>
      )}
    </div>
  );
}
