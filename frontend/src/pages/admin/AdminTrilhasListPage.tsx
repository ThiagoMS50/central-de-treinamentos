import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTrilhasQuery, useExcluirTrilhaMutation } from '../../hooks/useTrilhas';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';

export function AdminTrilhasListPage() {
  const { t } = useTranslation();
  const trilhasQuery = useTrilhasQuery();
  const excluirMutation = useExcluirTrilhaMutation();

  return (
    <div className="page">
      <AdminTabs />
      <div className="page-header">
        <h1>{t('admin.trilhas.title')}</h1>
        <Link to="/admin/trilhas/novo" className="btn btn-primary">
          {t('admin.trilhas.new')}
        </Link>
      </div>

      {trilhasQuery.isLoading && <Spinner />}
      {trilhasQuery.isError && <ErrorBanner onRetry={() => trilhasQuery.refetch()} />}
      {trilhasQuery.data && trilhasQuery.data.length === 0 && <EmptyState message={t('common.empty')} />}

      {trilhasQuery.data && trilhasQuery.data.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.trilhas.titulo')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {trilhasQuery.data.map((trilha) => (
                <tr key={trilha.id}>
                  <td>{trilha.titulo}</td>
                  <td className="table-actions">
                    <Link to={`/admin/trilhas/${trilha.id}/editar`} className="btn btn-secondary">
                      {t('common.edit')}
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm(t('common.confirmDelete'))) excluirMutation.mutate(trilha.id);
                      }}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
