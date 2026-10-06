import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Spinner, ErrorBanner, EmptyState } from './ui/Feedback';
import { Icon } from './ui/Icon';
import { useDetalheParticipanteQuery } from '../hooks/useGamificacao';
import { formatDate } from '../lib/format';
import type { ItemConcluido } from '../types/api';

export function ParticipanteDetalheModal({ alunoId, onClose }: { alunoId: string; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const query = useDetalheParticipanteQuery(alunoId);
  const data = query.data;

  const listaConcluidos = (itens: ItemConcluido[]) => (
    <ul className="concluido-lista">
      {itens.map((item, i) => (
        <li key={i}>
          <span className="concluido-check" aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <span className="concluido-info">
            <span className="concluido-titulo">{item.titulo}</span>
            <span className="concluido-data">{formatDate(item.concluidoEm, i18n.language)}</span>
          </span>
          <span className="concluido-pontos">
            +{item.pontos} {t('ranking.pointsShort')}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <Modal title={t('ranking.detailTitle')} onClose={onClose} size="lg">
      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}

      {data && (
        <div className="participante">
          {/* Resumo: quem é, quantos pontos e os números principais lado a lado. */}
          <div className="participante-resumo">
            <span className="gamificacao-avatar" aria-hidden="true">
              {data.nome.trim().charAt(0).toUpperCase()}
            </span>
            <div className="participante-identidade">
              <span className="participante-nome">{data.nome}</span>
              <span className="gamificacao-pontos-valor">{t('gamificacao.points', { count: data.totalPontos })}</span>
            </div>
          </div>

          <div className="participante-stats">
            <div className="stat">
              <span className="stat-valor">{data.cursos.length}</span>
              <span className="stat-label">{t('ranking.statCourses')}</span>
            </div>
            <div className="stat">
              <span className="stat-valor">{data.trilhas.length}</span>
              <span className="stat-label">{t('ranking.statTracks')}</span>
            </div>
            <div className="stat">
              <span className="stat-valor">
                {data.badges.filter((b) => b.conquistado).length}/{data.badges.length}
              </span>
              <span className="stat-label">{t('ranking.statBadges')}</span>
            </div>
          </div>

          <section className="modal-secao">
            <h3>{t('gamificacao.badges')}</h3>
            <div className="conquista-grid">
              {data.badges.map((badge) => (
                <div key={badge.codigo} className={`conquista${badge.conquistado ? ' conquista-ok' : ''}`}>
                  <span className="conquista-icone" aria-hidden="true">
                    {badge.icone}
                  </span>
                  <span className="conquista-texto">
                    <span className="conquista-nome">
                      {t(`gamificacao.badgeList.${badge.codigo}.nome`, { defaultValue: badge.nome })}
                    </span>
                    <span className="conquista-desc">
                      {badge.conquistado ? (
                        badge.conquistadoEm ? (
                          t('ranking.earnedOn', { data: formatDate(badge.conquistadoEm, i18n.language) })
                        ) : (
                          t(`gamificacao.badgeList.${badge.codigo}.descricao`, { defaultValue: badge.descricao })
                        )
                      ) : (
                        <>
                          <Icon name="lock" size={12} /> {t('gamificacao.badgeLocked')}
                        </>
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="modal-secao">
            <h3>{t('ranking.coursesCompleted')}</h3>
            {data.cursos.length === 0 ? (
              <EmptyState message={t('ranking.noneCompleted')} />
            ) : (
              listaConcluidos(data.cursos)
            )}
          </section>

          {data.trilhas.length > 0 && (
            <section className="modal-secao">
              <h3>{t('ranking.tracksCompleted')}</h3>
              {listaConcluidos(data.trilhas)}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
