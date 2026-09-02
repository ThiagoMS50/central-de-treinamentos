import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCursosQuery, useExcluirCursoMutation } from '../../hooks/useCursos';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminCursosListPage() {
  const { t } = useTranslation();
  const cursosQuery = useCursosQuery();
  const excluirMutation = useExcluirCursoMutation();
  const [paraExcluir, setParaExcluir] = useState<{ id: string; titulo: string } | null>(null);

  return (
    <div className="page">
      <AdminTabs />
      <div className="page-header">
        <h1>{t('admin.cursos.title')}</h1>
        <Link to="/admin/cursos/novo" className="btn btn-primary">
          {t('admin.cursos.new')}
        </Link>
      </div>

      {cursosQuery.isLoading && <Spinner />}
      {cursosQuery.isError && <ErrorBanner onRetry={() => cursosQuery.refetch()} />}
      {cursosQuery.data && cursosQuery.data.length === 0 && <EmptyState message={t('common.empty')} />}

      {cursosQuery.data && cursosQuery.data.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.cursos.titulo')}</th>
                <th>{t('admin.cursos.cargaHoraria')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {cursosQuery.data.map((curso) => (
                <tr key={curso.id}>
                  <td>{curso.titulo}</td>
                  <td>{curso.cargaHorariaHoras}</td>
                  <td className="table-actions">
                    <Link to={`/admin/cursos/${curso.id}/editar`} className="btn btn-secondary">
                      {t('common.edit')}
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setParaExcluir({ id: curso.id, titulo: curso.titulo })}
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
