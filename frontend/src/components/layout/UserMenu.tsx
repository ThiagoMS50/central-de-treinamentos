import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTour } from '../../hooks/useTour';
import { Icon } from '../ui/Icon';

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { start } = useTour();
  const { t } = useTranslation();

  if (!profile) return null;

  return (
    <div className="user-menu">
      <button type="button" className="icon-button" onClick={start} title={t('tour.replay')} aria-label={t('tour.replay')}>
        <Icon name="help" />
      </button>
      <div className="user-chip">
        <span className="user-avatar" aria-hidden="true">
          {profile.nome.trim().charAt(0).toUpperCase()}
        </span>
        <span className="user-chip-text">
          <span className="user-menu-name">{profile.nome}</span>
          <span className="user-menu-role">{t(`roles.${profile.role}`)}</span>
        </span>
      </div>
      <button
        type="button"
        className="icon-button"
        onClick={() => signOut()}
        title={t('common.logout')}
        aria-label={t('common.logout')}
      >
        <Icon name="logout" />
      </button>
    </div>
  );
}
