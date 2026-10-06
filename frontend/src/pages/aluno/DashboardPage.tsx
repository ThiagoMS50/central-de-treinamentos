import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCursosQuery } from '../../hooks/useCursos';
import { useTrilhasQuery } from '../../hooks/useTrilhas';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { StatusBadge, PrazoBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CourseThumb } from '../../components/ui/CourseThumb';
import { Icon } from '../../components/ui/Icon';
import { GamificacaoWidget } from '../../components/GamificacaoWidget';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoesQuery } from '../../hooks/useConfiguracoes';
import type { CursoListItem, CursoStatus } from '../../types/api';

type FiltroStatus = 'todos' | CursoStatus;
const FILTROS: FiltroStatus[] = ['todos', 'em_andamento', 'nao_iniciado', 'concluido'];

// Ordem de exibição: o que exige ação do aluno vem primeiro (atrasados, depois em andamento),
// concluídos por último.
const ORDEM_STATUS: Record<CursoStatus, number> = { em_andamento: 0, nao_iniciado: 1, concluido: 2 };
const atrasado = (c: CursoListItem) => (c.prazoStatus === 'atrasado' && c.status !== 'concluido' ? 0 : 1);
const porPrioridade = (a: CursoListItem, b: CursoListItem) =>
  atrasado(a) - atrasado(b) || ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status];

export function DashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const configuracoesQuery = useConfiguracoesQuery();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');

  const cursosQuery = useCursosQuery();
  const trilhasQuery = useTrilhasQuery();

  // Administrador gerencia o conteúdo mas não "estuda" — o painel usa uma linguagem neutra
  // ("Treinamentos"/"Trilhas") em vez de possessiva ("Meus treinamentos"/"Minhas trilhas"),
  // e não participa da gamificação nem recebe sugestão de curso.
  const ehAdmin = profile?.role === 'admin';
  const mostrarGamificacao = !ehAdmin && Boolean(configuracoesQuery.data?.rankingHabilitado);

  const cursosBuscados = (cursosQuery.data ?? []).filter((c) =>
    c.titulo.toLowerCase().includes(busca.toLowerCase()),
  );
  const contagem = (f: FiltroStatus) =>
    f === 'todos' ? cursosBuscados.length : cursosBuscados.filter((c) => c.status === f).length;
  const cursosFiltrados = cursosBuscados.filter((c) => filtro === 'todos' || c.status === filtro).sort(porPrioridade);

  // Destaque do topo: o curso não concluído mais prioritário (atrasado > em andamento > não iniciado).
  const sugerido = ehAdmin
    ? undefined
    : (cursosQuery.data ?? []).filter((c) => c.status !== 'concluido').sort(porPrioridade)[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>{ehAdmin ? t('dashboard.titleAdmin') : t('dashboard.title')}</h1>
        <input
          className="search-input"
          type="search"
          placeholder={t('common.search')}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {(sugerido || mostrarGamificacao) && (
        <div className={`dashboard-top${sugerido && mostrarGamificacao ? ' dashboard-top-split' : ''}`}>
          {sugerido && (
            <section className="hero">
              <div className="hero-text">
                <span className="hero-eyebrow">
                  {sugerido.prazoStatus === 'atrasado'
                    ? t('dashboard.heroLate')
                    : sugerido.status === 'em_andamento'
                      ? t('dashboard.heroContinue')
                      : t('dashboard.heroSuggested')}
                </span>
                <h2 className="hero-title">{sugerido.titulo}</h2>
                {sugerido.descricao && <p className="hero-description">{sugerido.descricao}</p>}
                <div className="hero-actions">
                  <Link to={`/cursos/${sugerido.id}`} className="btn btn-primary">
                    <Icon name="play" size={16} />
                    {sugerido.status === 'em_andamento' ? t('dashboard.resumeCourse') : t('dashboard.startCourse')}
                  </Link>
                  <span className="hero-meta">
                    <Icon name="clock" size={15} />
                    {sugerido.cargaHorariaHoras} {t('common.hours')}
                  </span>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <span className="hero-art-deco hero-art-deco-1" />
                <span className="hero-art-deco hero-art-deco-2" />
                <CourseThumb id={sugerido.id} titulo={sugerido.titulo} size="lg" />
              </div>
            </section>
          )}
          {mostrarGamificacao && <GamificacaoWidget />}
        </div>
      )}

      <section>
        <h2 className="section-title">{ehAdmin ? t('dashboard.trilhasTitleAdmin') : t('dashboard.trilhasTitle')}</h2>
        {trilhasQuery.isLoading && <Spinner />}
        {trilhasQuery.isError && <ErrorBanner onRetry={() => trilhasQuery.refetch()} />}
        {trilhasQuery.data && trilhasQuery.data.length === 0 && <EmptyState message={t('dashboard.emptyTrilhas')} />}
        {trilhasQuery.data && trilhasQuery.data.length > 0 && (
          <div className="trilha-row">
            {trilhasQuery.data.map((trilha) => (
              <Link key={trilha.id} to={`/trilhas/${trilha.id}`} className="trilha-tile">
                <CourseThumb id={trilha.id} titulo={trilha.titulo} size="sm" />
                <div className="trilha-tile-body">
                  <h3>{trilha.titulo}</h3>
                  {ehAdmin ? (
                    <span className="card-meta">
                      <Icon name="route" size={14} />
                      {trilha.totalCursos} {t('nav.cursos').toLowerCase()}
                    </span>
                  ) : (
                    <>
                      <ProgressBar percent={trilha.progressoPercentual} />
                      <span className="card-meta">
                        {trilha.cursosConcluidos}/{trilha.totalCursos} · {trilha.progressoPercentual}%
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">{t('dashboard.cursosTitle')}</h2>
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
              <Link key={curso.id} to={`/cursos/${curso.id}`} className="card card-link course-card">
                <CourseThumb id={curso.id} titulo={curso.titulo} />
                <div className="course-card-body">
                  <h3>{curso.titulo}</h3>
                  {curso.descricao && <p className="card-description">{curso.descricao}</p>}
                  <div className="card-badges">
                    <span className="card-meta">
                      <Icon name="clock" size={14} />
                      {curso.cargaHorariaHoras} {t('common.hours')}
                    </span>
                    {!ehAdmin && (
                      <>
                        <StatusBadge status={curso.status} />
                        <PrazoBadge prazoStatus={curso.prazoStatus} />
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
