import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTrilhasQuery, useExcluirTrilhaMutation } from '../../hooks/useTrilhas';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminTrilhasListPage() {
  const { t } = useTranslation();
  const trilhasQuery = useTrilhasQuery();
  const excluirMutation = useExcluirTrilhaMutation();
  const [paraExcluir, setParaExcluir] = useState<{ id: string; titulo: string } | null>(null);

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
                <th>{t('admin.trilhas.assignCourses')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {trilhasQuery.data.map((trilha) => (
                <tr key={trilha.id}>
                  <td>{trilha.titulo}</td>
                  <td>{trilha.totalCursos}</td>
                  <td className="table-actions">
                    <Link to={`/admin/trilhas/${trilha.id}/editar`} className="btn btn-secondary">
                      {t('common.edit')}
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setParaExcluir({ id: trilha.id, titulo: trilha.titulo })}
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

      {paraExcluir && (
        <ConfirmDialog
          title={t('common.delete')}
          message={t('common.confirmDeleteNamed', { nome: paraExcluir.titulo })}
          onConfirm={() => {
            excluirMutation.mutate(paraExcluir.id);
            setParaExcluir(null);
          }}
          onCancel={() => setParaExcluir(null)}
        />
      )}
    </div>
  );
}
