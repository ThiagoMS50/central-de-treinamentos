import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../Logo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { OnboardingTour } from '../OnboardingTour';
import { TourProvider } from '../../contexts/TourContext';
import { useAuth } from '../../hooks/useAuth';

export function AppLayout() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [menuAberto, setMenuAberto] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link-active' : ''}`;

  return (
    <TourProvider>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-brand">
            <Logo />
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label="menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
          >
            ☰
          </button>

          <nav className={`app-nav${menuAberto ? ' app-nav-open' : ''}`} onClick={() => setMenuAberto(false)}>
            <NavLink to="/cursos" className={linkClass}>
              {t('nav.cursos')}
            </NavLink>
            {profile && (profile.role === 'gestor' || profile.role === 'admin') && (
              <NavLink to="/relatorios" className={linkClass}>
                {t('nav.relatorios')}
              </NavLink>
            )}
            {profile?.role === 'admin' && (
              <NavLink to="/admin/cursos" className={linkClass}>
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>

          <div className="app-header-actions">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>

        <OnboardingTour />
      </div>
    </TourProvider>
  );
}
