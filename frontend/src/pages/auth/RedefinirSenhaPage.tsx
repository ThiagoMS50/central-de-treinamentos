import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Logo } from '../../components/Logo';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function RedefinirSenhaPage() {
  const { t } = useTranslation();
  const { status, error: authError, retry, signOut } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.redefinirSenha.mismatch'));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await signOut();
      navigate('/login', { replace: true, state: { senhaRedefinida: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="auth-page">
        <Spinner />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-page">
        <ErrorBanner message={authError ?? undefined} onRetry={retry} />
      </div>
    );
  }

  if (status === 'unauthenticated' || status === 'needsEmailConfirmation') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo />
          </div>
          <div className="error-banner">{t('auth.redefinirSenha.invalidLink')}</div>
          <p className="auth-switch">
            <Link to="/esqueci-senha">{t('auth.redefinirSenha.requestNewLink')}</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo />
        </div>
        <h1>{t('auth.redefinirSenha.title')}</h1>

        <form onSubmit={handleSubmit} className="form">
          <label>
            {t('auth.redefinirSenha.newPassword')}
            <PasswordInput required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            {t('auth.redefinirSenha.confirmPassword')}
            <PasswordInput
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {t('auth.redefinirSenha.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
