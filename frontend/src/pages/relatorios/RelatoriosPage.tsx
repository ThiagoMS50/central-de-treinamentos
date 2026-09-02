import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCursosQuery } from '../../hooks/useCursos';
import { useRelatorioDashboardQuery, useResumoPorAlunoQuery, exportarRelatorioCsv, type RelatorioFiltro } from '../../hooks/useRelatorios';
import { Spinner, EmptyState, ErrorBanner } from '../../components/ui/Feedback';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlunoProgressoModal } from '../../components/AlunoProgressoModal';

export function RelatoriosPage() {
  const { t } = useTranslation();
  const cursosQuery = useCursosQuery();
  const [filtro, setFiltro] = useState<RelatorioFiltro>({});
  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: string; nome: string } | null>(null);

  const dashboardQuery = useRelatorioDashboardQuery(filtro);
  const porAlunoQuery = useResumoPorAlunoQuery();

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
            <h2>{t('relatorios.employees')}</h2>
            {porAlunoQuery.isLoading && <Spinner />}
            {porAlunoQuery.isError && <ErrorBanner onRetry={() => porAlunoQuery.refetch()} />}
            {porAlunoQuery.data && porAlunoQuery.data.length === 0 && <EmptyState message={t('relatorios.noData')} />}
            {porAlunoQuery.data && porAlunoQuery.data.length > 0 && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.usuarios.nome')}</th>
                      <th>{t('ranking.coursesCompleted')}</th>
                      <th>%</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {porAlunoQuery.data.map((aluno) => (
                      <tr key={aluno.alunoId}>
                        <td>{aluno.nome}</td>
                        <td>
                          {aluno.cursosConcluidos}/{aluno.totalCursos}
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <ProgressBar percent={aluno.progressoPercentual} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setAlunoSelecionado({ id: aluno.alunoId, nome: aluno.nome })}
                          >
                            {t('admin.usuarios.viewProgress')}
                          </button>
                        </td>
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

      {alunoSelecionado && (
        <AlunoProgressoModal
          alunoId={alunoSelecionado.id}
          nome={alunoSelecionado.nome}
          onClose={() => setAlunoSelecionado(null)}
        />
      )}
    </div>
  );
}
