import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTour } from '../../hooks/useTour';

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { start } = useTour();
  const { t } = useTranslation();

  if (!profile) return null;

  return (
    <div className="user-menu">
      <span className="user-menu-name">{profile.nome}</span>
      <span className="badge badge-neutral">{t(`roles.${profile.role}`)}</span>
      <button type="button" className="btn btn-secondary" onClick={start} title={t('tour.replay')}>
        ?
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => signOut()}>
        {t('common.logout')}
      </button>
    </div>
  );
}
