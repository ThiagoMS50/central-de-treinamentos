import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMeuProgressoGamificacaoQuery } from '../hooks/useGamificacao';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui/Feedback';
import { Icon } from './ui/Icon';

export function GamificacaoWidget() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const query = useMeuProgressoGamificacaoQuery();

  if (query.isLoading) return <Spinner />;
  if (!query.data) return null;

  const { totalPontos, posicao, badges } = query.data;
  const conquistados = badges.filter((b) => b.conquistado).length;

  return (
    <div className="gamificacao-widget">
      <div className="gamificacao-perfil">
        <span className="gamificacao-avatar" aria-hidden="true">
          {profile?.nome.trim().charAt(0).toUpperCase()}
        </span>
        <div className="gamificacao-pontos">
          <span className="gamificacao-pontos-valor">{t('gamificacao.points', { count: totalPontos })}</span>
          <span className="gamificacao-pontos-label">{t('gamificacao.rank', { posicao })}</span>
        </div>
      </div>

      <div className="gamificacao-badges">
        <h3>
          {t('gamificacao.badges')}{' '}
          <span className="gamificacao-badges-count">
            {conquistados}/{badges.length}
          </span>
        </h3>
        <div className="badge-grid">
          {badges.map((badge) => (
            <div
              key={badge.codigo}
              className={`badge-item${badge.conquistado ? ' badge-item-conquistado' : ''}`}
              title={
                (t(`gamificacao.badgeList.${badge.codigo}.nome`, { defaultValue: badge.nome }) as string) +
                ' — ' +
                (badge.conquistado
                  ? t(`gamificacao.badgeList.${badge.codigo}.descricao`, { defaultValue: badge.descricao })
                  : t('gamificacao.badgeLocked'))
              }
            >
              <span className="badge-item-icone">{badge.icone}</span>
            </div>
          ))}
        </div>
      </div>

      <Link to="/ranking" className="gamificacao-link">
        {t('dashboard.viewRanking')} <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  );
}
