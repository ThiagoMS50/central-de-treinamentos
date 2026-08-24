import { useQuery } from '@tanstack/react-query';
import { apiDownload, apiFetch } from '../lib/apiClient';
import type { CertificadoListItem } from '../types/api';

export function useMeusCertificadosQuery() {
  return useQuery({ queryKey: ['certificados'], queryFn: () => apiFetch<CertificadoListItem[]>('/certificados/minhas') });
}

export function baixarCertificadoCurso(cursoId: string, titulo: string) {
  return apiDownload(`/certificados/curso/${cursoId}`, `certificado-${titulo}.pdf`, { method: 'POST' });
}

export function baixarCertificadoTrilha(trilhaId: string, titulo: string) {
  return apiDownload(`/certificados/trilha/${trilhaId}`, `certificado-${titulo}.pdf`, { method: 'POST' });
}
