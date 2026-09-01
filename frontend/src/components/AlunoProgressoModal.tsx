import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Spinner, ErrorBanner, EmptyState } from './ui/Feedback';
import { StatusBadge, PrazoBadge } from './ui/Badge';
import { useProgressoAlunoQuery } from '../hooks/useProgressoAluno';
import { formatDate } from '../lib/format';

export function AlunoProgressoModal({ alunoId, nome, onClose }: { alunoId: string; nome: string; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const query = useProgressoAlunoQuery(alunoId);

  return (
    <Modal title={t('admin.usuarios.progressTitle', { nome })} onClose={onClose}>
      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}
      {query.data && query.data.length === 0 && <EmptyState message={t('common.empty')} />}

      {query.data && query.data.length > 0 && (
        <ul className="modal-item-lista">
          {query.data.map((item) => (
            <li key={item.cursoId} className="progresso-item">
              <div className="progresso-item-titulo">
                <span>{item.titulo}</span>
                <div className="card-badges">
                  <StatusBadge status={item.status} />
                  <PrazoBadge prazoStatus={item.prazoStatus} />
                </div>
              </div>
              <div className="progresso-item-datas">
                {item.iniciadoEm && (
                  <span>
                    {t('admin.usuarios.startedAt')}: {formatDate(item.iniciadoEm, i18n.language)}
                  </span>
                )}
                {item.concluidoEm && (
                  <span>
                    {t('admin.usuarios.completedAt')}: {formatDate(item.concluidoEm, i18n.language)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
