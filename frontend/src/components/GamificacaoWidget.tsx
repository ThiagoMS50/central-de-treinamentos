import { useTranslation } from 'react-i18next';
import { useMeuProgressoGamificacaoQuery } from '../hooks/useGamificacao';
import { Spinner } from './ui/Feedback';

export function GamificacaoWidget() {
  const { t } = useTranslation();
  const query = useMeuProgressoGamificacaoQuery();

  if (query.isLoading) return <Spinner />;
  if (!query.data) return null;

  const { totalPontos, posicao, badges } = query.data;

  return (
    <div className="gamificacao-widget">
      <div className="gamificacao-pontos">
        <span className="gamificacao-pontos-valor">{totalPontos}</span>
        <span className="gamificacao-pontos-label">{t('gamificacao.myPoints')}</span>
        <span className="badge badge-info">{t('gamificacao.rank', { posicao })}</span>
      </div>

      <div className="gamificacao-badges">
        <h3>{t('gamificacao.badges')}</h3>
        <div className="badge-grid">
          {badges.map((badge) => (
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
    </div>
  );
}
