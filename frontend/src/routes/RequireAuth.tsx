import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner, ErrorBanner } from '../components/ui/Feedback';

export function RequireAuth() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <ErrorBanner message={error ?? undefined} onRetry={retry} />;
  if (status === 'unauthenticated' || status === 'needsEmailConfirmation') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
