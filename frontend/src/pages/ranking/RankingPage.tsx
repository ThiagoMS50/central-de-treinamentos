import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRankingQuery } from '../../hooks/useGamificacao';
import { useConfiguracoesQuery } from '../../hooks/useConfiguracoes';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { ParticipanteDetalheModal } from '../../components/ParticipanteDetalheModal';

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
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('ranking.position')}</th>
                <th>{t('ranking.name')}</th>
                <th>{t('ranking.points')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((item) => (
                <tr key={item.posicao} className={item.souEu ? 'ranking-row-eu' : undefined}>
                  <td>#{item.posicao}</td>
                  <td>
                    {item.nome} {item.souEu && <span className="hint-text">{t('ranking.you')}</span>}
                  </td>
                  <td>{item.pontos}</td>
                  <td>
                    {item.podeVerDetalhes && (
                      <button type="button" className="btn btn-secondary" onClick={() => setParticipanteSelecionado(item.alunoId)}>
                        {t('ranking.viewDetails')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {participanteSelecionado && (
        <ParticipanteDetalheModal alunoId={participanteSelecionado} onClose={() => setParticipanteSelecionado(null)} />
      )}
    </div>
  );
}
