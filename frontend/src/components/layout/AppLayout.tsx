import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../Logo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { UserMenu } from './UserMenu';
import { OnboardingTour } from '../OnboardingTour';
import { Icon } from '../ui/Icon';
import { TourProvider } from '../../contexts/TourContext';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoesQuery } from '../../hooks/useConfiguracoes';

export function AppLayout() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [menuAberto, setMenuAberto] = useState(false);
  const configuracoesQuery = useConfiguracoesQuery();
  const rankingHabilitado = configuracoesQuery.data?.rankingHabilitado ?? true;
  const ehAdmin = profile?.role === 'admin';

  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link-active' : ''}`;

  return (
    <TourProvider>
      <div className="app-shell">
        {/* No celular o menu lateral vira uma gaveta; o fundo escurecido fecha ao tocar fora. */}
        {menuAberto && <div className="sidebar-backdrop" onClick={() => setMenuAberto(false)} />}

        <aside className={`sidebar${menuAberto ? ' sidebar-open' : ''}`}>
          <div className="sidebar-brand">
            <Logo />
          </div>

          <nav className="sidebar-nav" data-tour="menu" onClick={() => setMenuAberto(false)}>
            <span className="sidebar-section">{t('nav.sectionLearn')}</span>
            <NavLink to="/cursos" className={linkClass}>
              <Icon name="compass" />
              {t('nav.cursos')}
            </NavLink>
            {rankingHabilitado && (
              <NavLink to="/ranking" className={linkClass} data-tour="nav-ranking">
                <Icon name="trophy" />
                {t('nav.ranking')}
              </NavLink>
            )}

            {ehAdmin && <span className="sidebar-section">{t('nav.sectionManage')}</span>}
            {ehAdmin && (
              <NavLink to="/relatorios" className={linkClass} data-tour="nav-relatorios">
                <Icon name="chart" />
                {t('nav.relatorios')}
              </NavLink>
            )}
            {ehAdmin && (
              <NavLink to="/admin/cursos" className={linkClass} data-tour="nav-admin">
                <Icon name="settings" />
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>
        </aside>

        <div className="app-main">
          <header className="topbar">
            <button
              type="button"
              className="nav-toggle"
              aria-label="menu"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((v) => !v)}
            >
              <Icon name="menu" size={20} />
            </button>
            <div className="topbar-brand">
              <Logo />
            </div>
            <div className="topbar-actions">
              <div className="topbar-prefs" data-tour="preferencias">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
              <UserMenu />
            </div>
          </header>

          <main className="app-content">
            <Outlet />
          </main>
        </div>

        <OnboardingTour />
      </div>
    </TourProvider>
  );
}
