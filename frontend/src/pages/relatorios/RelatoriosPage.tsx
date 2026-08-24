import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCursosQuery } from '../../hooks/useCursos';
import { useRelatorioDashboardQuery, exportarRelatorioCsv, type RelatorioFiltro } from '../../hooks/useRelatorios';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { formatDate } from '../../lib/format';

export function RelatoriosPage() {
  const { t, i18n } = useTranslation();
  const cursosQuery = useCursosQuery();
  const [filtro, setFiltro] = useState<RelatorioFiltro>({});

  const dashboardQuery = useRelatorioDashboardQuery(filtro);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('relatorios.title')}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => exportarRelatorioCsv(filtro)}>
          {t('relatorios.exportCsv')}
        </button>
      </div>

      <div className="filters-bar">
        <label>
          {t('relatorios.from')}
          <input
            type="date"
            onChange={(e) => setFiltro((f) => ({ ...f, periodoInicio: e.target.value || undefined }))}
          />
        </label>
        <label>
          {t('relatorios.to')}
          <input type="date" onChange={(e) => setFiltro((f) => ({ ...f, periodoFim: e.target.value || undefined }))} />
        </label>
        <label>
          {t('relatorios.course')}
          <select onChange={(e) => setFiltro((f) => ({ ...f, cursoId: e.target.value || undefined }))}>
            <option value="">{t('common.empty')}</option>
            {cursosQuery.data?.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {dashboardQuery.isLoading && <Spinner />}
      {dashboardQuery.isError && <ErrorBanner onRetry={() => dashboardQuery.refetch()} />}

      {dashboardQuery.data && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-value">{dashboardQuery.data.taxaConclusaoGeral}%</span>
              <span className="kpi-label">{t('relatorios.completionRate')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-value">{dashboardQuery.data.tempoMedioConclusaoDias}</span>
              <span className="kpi-label">{t('relatorios.avgTime')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-value">{dashboardQuery.data.notaMediaQuizPercentual}%</span>
              <span className="kpi-label">{t('relatorios.avgQuizScore')}</span>
            </div>
          </div>

          <section>
            <h2>{t('relatorios.completionByCourse')}</h2>
            {dashboardQuery.data.conclusaoPorCurso.length === 0 ? (
              <EmptyState message={t('relatorios.noData')} />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('relatorios.course')}</th>
                      <th>{t('status.concluido')}</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardQuery.data.conclusaoPorCurso.map((c) => (
                      <tr key={c.cursoId}>
                        <td>{c.titulo}</td>
                        <td>
                          {c.concluidos}/{c.totalMatriculados}
                        </td>
                        <td>{c.taxaConclusao.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2>{t('relatorios.overdue')}</h2>
            {dashboardQuery.data.atrasados.length === 0 ? (
              <EmptyState message={t('relatorios.noData')} />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('relatorios.user')}</th>
                      <th>{t('relatorios.course')}</th>
                      <th>{t('curso.deadline')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardQuery.data.atrasados.map((p) => (
                      <tr key={`${p.alunoId}-${p.cursoId}`}>
                        <td>{p.alunoNome}</td>
                        <td>{p.cursoTitulo}</td>
                        <td>{formatDate(p.prazoEm, i18n.language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {dashboardQuery.data.progressoPorEquipe.length > 0 && (
            <section>
              <h2>{t('relatorios.teamProgress')}</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.usuarios.manager')}</th>
                      <th>{t('relatorios.user')}</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardQuery.data.progressoPorEquipe.map((eq) => (
                      <tr key={eq.gestorId}>
                        <td>{eq.gestorNome}</td>
                        <td>{eq.totalAlunos}</td>
                        <td>{eq.progressoMedioPercentual.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
