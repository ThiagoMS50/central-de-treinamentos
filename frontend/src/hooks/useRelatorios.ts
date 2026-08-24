import { useQuery } from '@tanstack/react-query';
import { apiDownload, apiFetch } from '../lib/apiClient';
import type { RelatorioDashboard } from '../types/api';

export interface RelatorioFiltro {
  periodoInicio?: string;
  periodoFim?: string;
  cursoId?: string;
  usuarioId?: string;
}

function buildQuery(filtro: RelatorioFiltro): string {
  const params = new URLSearchParams();
  if (filtro.periodoInicio) params.set('periodoInicio', filtro.periodoInicio);
  if (filtro.periodoFim) params.set('periodoFim', filtro.periodoFim);
  if (filtro.cursoId) params.set('cursoId', filtro.cursoId);
  if (filtro.usuarioId) params.set('usuarioId', filtro.usuarioId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useRelatorioDashboardQuery(filtro: RelatorioFiltro) {
  return useQuery({
    queryKey: ['relatorios', 'dashboard', filtro],
    queryFn: () => apiFetch<RelatorioDashboard>(`/relatorios/dashboard${buildQuery(filtro)}`),
    refetchOnWindowFocus: true,
  });
}

export function exportarRelatorioCsv(filtro: RelatorioFiltro) {
  return apiDownload(`/relatorios/export.csv${buildQuery(filtro)}`, 'relatorio.csv');
}
