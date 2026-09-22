import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, setMode } = useTheme();

  return (
    <select
      className="theme-switcher"
      value={mode}
      onChange={(e) => setMode(e.target.value as ThemeMode)}
      aria-label={t('common.theme.label')}
    >
      <option value="system">{t('common.theme.system')}</option>
      <option value="light">{t('common.theme.light')}</option>
      <option value="dark">{t('common.theme.dark')}</option>
    </select>
  );
}
