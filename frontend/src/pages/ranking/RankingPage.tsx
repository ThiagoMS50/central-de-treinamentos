import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRankingQuery } from '../../hooks/useGamificacao';
import { useConfiguracoesQuery } from '../../hooks/useConfiguracoes';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { ParticipanteDetalheModal } from '../../components/ParticipanteDetalheModal';
import { Icon } from '../../components/ui/Icon';

export function RankingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const configuracoesQuery = useConfiguracoesQuery();
  const query = useRankingQuery();
  const [participanteSelecionado, setParticipanteSelecionado] = useState<string | null>(null);

  // Se o Admin desativou o ranking, essa tela não deve ficar acessível nem por link direto.
  useEffect(() => {
    if (configuracoesQuery.data && !configuracoesQuery.data.rankingHabilitado) {
      navigate('/cursos', { replace: true });
    }
  }, [configuracoesQuery.data, navigate]);

  if (configuracoesQuery.isLoading) return <Spinner />;
  if (configuracoesQuery.data && !configuracoesQuery.data.rankingHabilitado) return null;

  return (
    <div className="page">
      <h1>{t('ranking.title')}</h1>

      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}
      {query.data && query.data.length === 0 && <EmptyState message={t('ranking.empty')} />}

      {query.data && query.data.length > 0 && (
        <ol className="ranking-lista" aria-label={t('ranking.title')}>
          {query.data.map((item) => (
            <li
              key={item.alunoId}
              className={`ranking-item${item.souEu ? ' ranking-item-eu' : ''}${item.posicao <= 3 ? ` ranking-top ranking-top-${item.posicao}` : ''}`}
            >
              <span className="ranking-posicao" aria-label={`${t('ranking.position')} ${item.posicao}`}>
                {item.posicao <= 3 ? <Icon name="medal" size={20} /> : `#${item.posicao}`}
              </span>
              <span className="user-avatar" aria-hidden="true">
                {item.nome.trim().charAt(0).toUpperCase()}
              </span>
              <span className="ranking-nome">
                <span className="ranking-nome-texto">{item.nome}</span>
                {item.souEu && <span className="badge badge-info">{t('ranking.youLabel')}</span>}
              </span>
              <span className="ranking-pontos">
                {item.pontos} <small>{t('ranking.pointsShort')}</small>
              </span>
              {item.podeVerDetalhes ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setParticipanteSelecionado(item.alunoId)}>
                  {t('ranking.viewDetails')}
                </button>
              ) : (
                <span className="ranking-acao-vazia" />
              )}
            </li>
          ))}
        </ol>
      )}

      {participanteSelecionado && (
        <ParticipanteDetalheModal alunoId={participanteSelecionado} onClose={() => setParticipanteSelecionado(null)} />
      )}
    </div>
  );
}
