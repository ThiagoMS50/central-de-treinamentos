import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/api';

export function RequireRole({ roles }: { roles: Role[] }) {
  const { profile } = useAuth();
  if (!profile || !roles.includes(profile.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
