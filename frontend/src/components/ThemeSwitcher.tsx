import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../contexts/ThemeContext';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { Icon, type IconName } from './ui/Icon';

const OPCOES: { mode: ThemeMode; icon: IconName }[] = [
  { mode: 'dark', icon: 'moon' },
  { mode: 'light', icon: 'sun' },
  { mode: 'system', icon: 'monitor' },
];

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, setMode } = useTheme();
  const atual = OPCOES.find((o) => o.mode === mode) ?? OPCOES[0];

  return (
    <Dropdown label={t('common.theme.label')} trigger={<Icon name={atual.icon} />}>
      {(close) =>
        OPCOES.map((opcao) => (
          <DropdownItem
            key={opcao.mode}
            selected={opcao.mode === mode}
            icon={<Icon name={opcao.icon} size={16} />}
            onSelect={() => {
              setMode(opcao.mode);
              close();
            }}
          >
            {t(`common.theme.${opcao.mode}`)}
          </DropdownItem>
        ))
      }
    </Dropdown>
  );
}
