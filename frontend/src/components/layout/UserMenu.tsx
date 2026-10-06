import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTour } from '../../hooks/useTour';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Icon } from '../ui/Icon';
import { EditarNomeModal } from '../EditarNomeModal';

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { start } = useTour();
  const { t } = useTranslation();
  const [editandoNome, setEditandoNome] = useState(false);

  if (!profile) return null;

  return (
    <>
      <Dropdown
        label={t('userMenu.open')}
        triggerClassName="user-chip"
        trigger={
          <>
            <span className="user-avatar" aria-hidden="true">
              {profile.nome.trim().charAt(0).toUpperCase()}
            </span>
            <span className="user-chip-text">
              <span className="user-menu-name">{profile.nome}</span>
              <span className="user-menu-role">{t(`roles.${profile.role}`)}</span>
            </span>
            <span className="user-chip-chevron">
              <Icon name="chevronDown" size={14} />
            </span>
          </>
        }
      >
        {(close) => (
          <>
            <div className="dropdown-header">
              <span className="dropdown-header-name">{profile.nome}</span>
              <span className="dropdown-header-email">{profile.email}</span>
            </div>
            <DropdownItem
              icon={<Icon name="edit" size={16} />}
              onSelect={() => {
                close();
                setEditandoNome(true);
              }}
            >
              {t('userMenu.editName')}
            </DropdownItem>
            <DropdownItem
              icon={<Icon name="help" size={16} />}
              onSelect={() => {
                close();
                start();
              }}
            >
              {t('tour.replay')}
            </DropdownItem>
            <div className="dropdown-divider" />
            <DropdownItem danger icon={<Icon name="logout" size={16} />} onSelect={() => signOut()}>
              {t('common.logout')}
            </DropdownItem>
          </>
        )}
      </Dropdown>

      {editandoNome && <EditarNomeModal nomeAtual={profile.nome} onClose={() => setEditandoNome(false)} />}
    </>
  );
}
