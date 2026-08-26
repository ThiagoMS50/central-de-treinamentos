import { useTranslation } from 'react-i18next';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { useConfiguracoesQuery, useAtualizarConfiguracoesMutation } from '../../hooks/useConfiguracoes';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';

export function AdminConfiguracoesPage() {
  const { t } = useTranslation();
  const query = useConfiguracoesQuery();
  const mutation = useAtualizarConfiguracoesMutation();
  const { salvo, mostrar } = useSavedFeedback();

  function alternarRanking(checked: boolean) {
    mutation.mutate(checked, { onSuccess: mostrar });
  }

  return (
    <div className="page">
      <AdminTabs />
      <h1>{t('admin.configuracoes.title')}</h1>

      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}

      {query.data && (
        <div className="form">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={query.data.rankingHabilitado}
              disabled={mutation.isPending}
              onChange={(e) => alternarRanking(e.target.checked)}
            />
            {t('admin.configuracoes.rankingHabilitado')}
          </label>
          <p className="hint-text">{t('admin.configuracoes.rankingHint')}</p>

          {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
        </div>
      )}
    </div>
  );
}
