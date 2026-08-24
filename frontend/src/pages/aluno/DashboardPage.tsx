import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCursosQuery } from '../../hooks/useCursos';
import { useTrilhasQuery } from '../../hooks/useTrilhas';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge, PrazoBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function DashboardPage() {
  const { t } = useTranslation();
  const [busca, setBusca] = useState('');

  const cursosQuery = useCursosQuery();
  const trilhasQuery = useTrilhasQuery();

  const cursosFiltrados = (cursosQuery.data ?? []).filter((c) =>
    c.titulo.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <input
          className="search-input"
          placeholder={t('common.search')}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <section>
        <h2>{t('dashboard.trilhasTitle')}</h2>
        {trilhasQuery.isLoading && <Spinner />}
        {trilhasQuery.isError && <ErrorBanner onRetry={() => trilhasQuery.refetch()} />}
        {trilhasQuery.data && trilhasQuery.data.length === 0 && <EmptyState message={t('dashboard.emptyTrilhas')} />}
        {trilhasQuery.data && trilhasQuery.data.length > 0 && (
          <div className="card-grid">
            {trilhasQuery.data.map((trilha) => (
              <Link key={trilha.id} to={`/trilhas/${trilha.id}`} className="card card-link">
                <h3>{trilha.titulo}</h3>
                {trilha.descricao && <p className="card-description">{trilha.descricao}</p>}
                <ProgressBar percent={trilha.progressoPercentual} />
                <span className="card-meta">
                  {trilha.cursosConcluidos}/{trilha.totalCursos}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>{t('dashboard.cursosTitle')}</h2>
        {cursosQuery.isLoading && <Spinner />}
        {cursosQuery.isError && <ErrorBanner onRetry={() => cursosQuery.refetch()} />}
        {cursosQuery.data && cursosFiltrados.length === 0 && <EmptyState message={t('dashboard.emptyCursos')} />}
        {cursosFiltrados.length > 0 && (
          <div className="card-grid">
            {cursosFiltrados.map((curso) => (
              <Link key={curso.id} to={`/cursos/${curso.id}`} className="card card-link">
                <h3>{curso.titulo}</h3>
                {curso.descricao && <p className="card-description">{curso.descricao}</p>}
                <div className="card-badges">
                  <StatusBadge status={curso.status} />
                  <PrazoBadge prazoStatus={curso.prazoStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
