import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Spinner, ErrorBanner, EmptyState } from './ui/Feedback';
import { useDetalheParticipanteQuery } from '../hooks/useGamificacao';
import { formatDate } from '../lib/format';

export function ParticipanteDetalheModal({ alunoId, onClose }: { alunoId: string; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const query = useDetalheParticipanteQuery(alunoId);

  return (
    <Modal title={query.data?.nome ?? t('ranking.detailTitle')} onClose={onClose}>
      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}

      {query.data && (
        <>
          <p className="gamificacao-pontos-valor">{t('gamificacao.points', { count: query.data.totalPontos })}</p>

          <div className="modal-secao">
            <h3>{t('ranking.coursesCompleted')}</h3>
            {query.data.cursos.length === 0 ? (
              <EmptyState message={t('common.empty')} />
            ) : (
              <ul className="modal-item-lista">
                {query.data.cursos.map((item, i) => (
                  <li key={i}>
                    <span>{item.titulo}</span>
                    <span>
                      +{item.pontos} · {formatDate(item.concluidoEm, i18n.language)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {query.data.trilhas.length > 0 && (
            <div className="modal-secao">
              <h3>{t('ranking.tracksCompleted')}</h3>
              <ul className="modal-item-lista">
                {query.data.trilhas.map((item, i) => (
                  <li key={i}>
                    <span>{item.titulo}</span>
                    <span>
                      +{item.pontos} · {formatDate(item.concluidoEm, i18n.language)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-secao">
            <h3>{t('gamificacao.badges')}</h3>
            <div className="badge-grid">
              {query.data.badges.map((badge) => (
                <div
                  key={badge.codigo}
                  className={`badge-item${badge.conquistado ? ' badge-item-conquistado' : ''}`}
                  title={
                    badge.conquistado
                      ? t(`gamificacao.badgeList.${badge.codigo}.descricao`, { defaultValue: badge.descricao })
                      : t('gamificacao.badgeLocked')
                  }
                >
                  <span className="badge-item-icone">{badge.icone}</span>
                  <span className="badge-item-nome">{t(`gamificacao.badgeList.${badge.codigo}.nome`, { defaultValue: badge.nome })}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
