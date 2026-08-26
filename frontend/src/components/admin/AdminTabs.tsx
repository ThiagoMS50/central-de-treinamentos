import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AdminTabs() {
  const { t } = useTranslation();
  const linkClass = ({ isActive }: { isActive: boolean }) => `admin-tab${isActive ? ' admin-tab-active' : ''}`;

  return (
    <nav className="admin-tabs">
      <NavLink to="/admin/cursos" className={linkClass}>
        {t('admin.cursos.title')}
      </NavLink>
      <NavLink to="/admin/trilhas" className={linkClass}>
        {t('admin.trilhas.title')}
      </NavLink>
      <NavLink to="/admin/usuarios" className={linkClass}>
        {t('admin.usuarios.title')}
      </NavLink>
      {/*<NavLink to="/admin/configuracoes" className={linkClass}>
        {t('admin.configuracoes.title')}
      </NavLink>*/}
    </nav>
  );
}
