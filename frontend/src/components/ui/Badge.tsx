import { useTranslation } from 'react-i18next';
import type { CursoStatus, PrazoStatus } from '../../types/api';

const STATUS_CLASS: Record<CursoStatus, string> = {
  nao_iniciado: 'badge-neutral',
  em_andamento: 'badge-info',
  concluido: 'badge-success',
};

export function StatusBadge({ status }: { status: CursoStatus }) {
  const { t } = useTranslation();
  return <span className={`badge ${STATUS_CLASS[status]}`}>{t(`status.${status}`)}</span>;
}

export function PrazoBadge({ prazoStatus }: { prazoStatus: PrazoStatus }) {
  const { t } = useTranslation();
  if (!prazoStatus) return null;
  const cls = prazoStatus === 'atrasado' ? 'badge-danger' : 'badge-success';
  return <span className={`badge ${cls}`}>{t(`status.${prazoStatus}`)}</span>;
}
