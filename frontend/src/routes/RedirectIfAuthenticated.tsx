import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RedirectIfAuthenticated() {
  const { status } = useAuth();
  if (status === 'ready') return <Navigate to="/cursos" replace />;
  return <Outlet />;
}
