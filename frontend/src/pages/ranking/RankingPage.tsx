import { useTranslation } from 'react-i18next';
import { useRankingQuery } from '../../hooks/useGamificacao';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';

export function RankingPage() {
  const { t } = useTranslation();
  const query = useRankingQuery();

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
