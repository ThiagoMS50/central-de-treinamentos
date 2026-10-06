import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCursosQuery } from '../../hooks/useCursos';
import { useTrilhasQuery } from '../../hooks/useTrilhas';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge, PrazoBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { GamificacaoWidget } from '../../components/GamificacaoWidget';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoesQuery } from '../../hooks/useConfiguracoes';
import type { CursoStatus } from '../../types/api';

type FiltroStatus = 'todos' | CursoStatus;
const FILTROS: FiltroStatus[] = ['todos', 'em_andamento', 'nao_iniciado', 'concluido'];

// Ordem de exibição: o que exige ação do aluno vem primeiro (atrasados, depois em andamento),
// concluídos por último.
const ORDEM_STATUS: Record<CursoStatus, number> = { em_andamento: 0, nao_iniciado: 1, concluido: 2 };

export function DashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const configuracoesQuery = useConfiguracoesQuery();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');

  const cursosQuery = useCursosQuery();
  const trilhasQuery = useTrilhasQuery();

  const cursosBuscados = (cursosQuery.data ?? []).filter((c) =>
    c.titulo.toLowerCase().includes(busca.toLowerCase()),
  );
  const contagem = (f: FiltroStatus) =>
    f === 'todos' ? cursosBuscados.length : cursosBuscados.filter((c) => c.status === f).length;
  const atrasado = (c: (typeof cursosBuscados)[number]) =>
    c.prazoStatus === 'atrasado' && c.status !== 'concluido' ? 0 : 1;
  const cursosFiltrados = cursosBuscados
    .filter((c) => filtro === 'todos' || c.status === filtro)
    .sort((a, b) => atrasado(a) - atrasado(b) || ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status]);

  // Administrador gerencia o conteúdo mas não "estuda" — o painel usa uma linguagem neutra
  // ("Treinamentos"/"Trilhas") em vez de possessiva ("Meus treinamentos"/"Minhas trilhas"),
  // e não participa da gamificação (isso é só para quem de fato faz os cursos).
  const ehAdmin = profile?.role === 'admin';

  return (
    <div className="page">
      <div className="page-header">
        <h1>{ehAdmin ? t('dashboard.titleAdmin') : t('dashboard.title')}</h1>
        <input
          className="search-input"
          placeholder={t('common.search')}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {!ehAdmin && configuracoesQuery.data?.rankingHabilitado && <GamificacaoWidget />}

      <section>
        <h2>{ehAdmin ? t('dashboard.trilhasTitleAdmin') : t('dashboard.trilhasTitle')}</h2>
        {trilhasQuery.isLoading && <Spinner />}
        {trilhasQuery.isError && <ErrorBanner onRetry={() => trilhasQuery.refetch()} />}
        {trilhasQuery.data && trilhasQuery.data.length === 0 && <EmptyState message={t('dashboard.emptyTrilhas')} />}
        {trilhasQuery.data && trilhasQuery.data.length > 0 && (
          <div className="card-grid">
            {trilhasQuery.data.map((trilha) => (
              <Link key={trilha.id} to={`/trilhas/${trilha.id}`} className="card card-link">
                <h3>{trilha.titulo}</h3>
                {trilha.descricao && <p className="card-description">{trilha.descricao}</p>}
                {!ehAdmin && (
                  <div className="card-footer">
                    <ProgressBar percent={trilha.progressoPercentual} />
                    <span className="card-meta">
                      {trilha.cursosConcluidos}/{trilha.totalCursos}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-header">
          <h2>{t('dashboard.cursosTitle')}</h2>
          {!ehAdmin && cursosBuscados.length > 0 && (
            <div className="filter-tabs" role="group" aria-label={t('dashboard.filterLabel')}>
              {FILTROS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-tab${filtro === f ? ' active' : ''}`}
                  aria-pressed={filtro === f}
                  onClick={() => setFiltro(f)}
                >
                  {f === 'todos' ? t('dashboard.filterAll') : t(`status.${f}`)}
                  <span className="filter-tab-count">{contagem(f)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {cursosQuery.isLoading && <Spinner />}
        {cursosQuery.isError && <ErrorBanner onRetry={() => cursosQuery.refetch()} />}
        {cursosQuery.data && cursosFiltrados.length === 0 && (
          <EmptyState
            message={cursosBuscados.length > 0 ? t('dashboard.emptyFiltro') : t('dashboard.emptyCursos')}
          />
        )}
        {cursosFiltrados.length > 0 && (
          <div className="card-grid">
            {cursosFiltrados.map((curso) => (
              <Link key={curso.id} to={`/cursos/${curso.id}`} className="card card-link">
                <h3>{curso.titulo}</h3>
                {curso.descricao && <p className="card-description">{curso.descricao}</p>}
                {!ehAdmin && (
                  <div className="card-badges">
                    <StatusBadge status={curso.status} />
                    <PrazoBadge prazoStatus={curso.prazoStatus} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
