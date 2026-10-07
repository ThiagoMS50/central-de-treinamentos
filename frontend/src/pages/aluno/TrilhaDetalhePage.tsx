import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useTrilhaQuery } from '../../hooks/useTrilhas';
import { baixarCertificadoTrilha } from '../../hooks/useCertificados';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CourseThumb } from '../../components/ui/CourseThumb';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import type { CursoStatus } from '../../types/api';

const ACAO_POR_STATUS: Record<CursoStatus, string> = {
  nao_iniciado: 'trilha.startCourse',
  em_andamento: 'trilha.continueCourse',
  concluido: 'trilha.reviewCourse',
};

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
  const cursos = trilha.cursos.slice().sort((a, b) => a.ordem - b.ordem);
  // Próximo curso a fazer: o primeiro (na ordem da trilha) que ainda não foi concluído.
  const proximoId = ehAdmin ? undefined : cursos.find((c) => c.status !== 'concluido')?.cursoId;

  return (
    <div className="page">
      <Link to="/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <header className="detalhe-header">
        <div className="detalhe-header-texto">
          <h1>{trilha.titulo}</h1>
          {trilha.descricao && <p className="curso-descricao">{trilha.descricao}</p>}
          <div className="meta-chips">
            <span className="meta-chip">
              <Icon name="route" size={15} />
              {t('trilha.courses', { count: trilha.totalCursos })}
            </span>
          </div>
        </div>
        {!ehAdmin && (
          <div className="detalhe-progresso">
            <span className="detalhe-progresso-label">
              {trilha.cursosConcluidos}/{trilha.totalCursos} · {t('trilha.percentDone', { percent: trilha.progressoPercentual })}
            </span>
            <ProgressBar percent={trilha.progressoPercentual} />
          </div>
        )}
      </header>

      {!ehAdmin && trilha.completa && (
        <div className="certificado-banner">
          <span className="certificado-icone" aria-hidden="true">
            <Icon name="certificate" size={24} />
          </span>
          <p>{t('trilha.certificateReady')}</p>
          <button type="button" className="btn btn-primary" onClick={() => baixarCertificadoTrilha(trilha.id, trilha.titulo)}>
            <Icon name="download" size={16} />
            {t('trilha.downloadCertificate')}
          </button>
        </div>
      )}

      <section>
        <h2 className="section-title">{t('trilha.coursesInTrack')}</h2>
        <ol className="trilha-timeline">
          {cursos.map((curso, i) => {
            const ok = !ehAdmin && curso.status === 'concluido';
            const proximo = curso.cursoId === proximoId;
            return (
              <li key={curso.cursoId} className={`timeline-item${ok ? ' timeline-item-ok' : ''}${proximo ? ' timeline-item-proximo' : ''}`}>
                <span className="timeline-marcador" aria-hidden="true">
                  {ok ? <Icon name="check" size={14} /> : i + 1}
                </span>
                <div className="timeline-card">
                  <CourseThumb id={curso.cursoId} titulo={curso.titulo} size="sm" />
                  <div className="timeline-card-texto">
                    <h3>{curso.titulo}</h3>
                    {!ehAdmin && <StatusBadge status={curso.status} />}
                  </div>
                  <Link
                    to={`/cursos/${curso.cursoId}`}
                    className={`btn btn-sm ${proximo ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {ehAdmin ? t('trilha.openCourse') : t(ACAO_POR_STATUS[curso.status])}
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {!ehAdmin && !trilha.completa && <p className="hint-text">{t('trilha.completeAll')}</p>}
    </div>
  );
}
