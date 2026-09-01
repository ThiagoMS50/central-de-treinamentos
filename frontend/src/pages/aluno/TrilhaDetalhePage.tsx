import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useTrilhaQuery } from '../../hooks/useTrilhas';
import { baixarCertificadoTrilha } from '../../hooks/useCertificados';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';

export function TrilhaDetalhePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const trilhaQuery = useTrilhaQuery(id);

  if (trilhaQuery.isLoading) return <Spinner />;
  if (trilhaQuery.isError) return <ErrorBanner onRetry={() => trilhaQuery.refetch()} />;
  if (!trilhaQuery.data) return null;

  const trilha = trilhaQuery.data;
  // Mesma lógica do painel principal e do detalhe de curso: Admin revisa conteúdo, não estuda.
  const ehAdmin = profile?.role === 'admin';

  return (
    <div className="page">
      <Link to="/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <div className="page-header">
        <h1>{trilha.titulo}</h1>
      </div>

      {trilha.descricao && <p>{trilha.descricao}</p>}

      {!ehAdmin && (
        <div className="trilha-progress">
          <ProgressBar percent={trilha.progressoPercentual} />
          <span>
            {trilha.cursosConcluidos}/{trilha.totalCursos} — {t('trilha.progress')}
          </span>
        </div>
      )}

      <section>
        <h2>{t('trilha.coursesInTrack')}</h2>
        <ol className="trilha-curso-list">
          {trilha.cursos
            .slice()
            .sort((a, b) => a.ordem - b.ordem)
            .map((curso) => (
              <li key={curso.cursoId}>
                <Link to={`/cursos/${curso.cursoId}`}>{curso.titulo}</Link>
                {!ehAdmin && <StatusBadge status={curso.status} />}
              </li>
            ))}
        </ol>
      </section>

      {!ehAdmin && (
        <section className="curso-actions">
          {trilha.completa ? (
            <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoTrilha(trilha.id, trilha.titulo)}>
              {t('trilha.downloadCertificate')}
            </button>
          ) : (
            <p className="hint-text">{t('trilha.completeAll')}</p>
          )}
        </section>
      )}
    </div>
  );
}
