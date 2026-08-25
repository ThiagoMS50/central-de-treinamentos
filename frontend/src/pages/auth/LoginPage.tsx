import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/Logo';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const senhaRedefinida = Boolean((location.state as { senhaRedefinida?: boolean } | null)?.senhaRedefinida);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      const from = (location.state as { from?: Location })?.from;
      navigate(from ? `${from.pathname}${from.search}` : '/cursos', { replace: true });
    } catch {
      setError(t('auth.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo />
        </div>
        <h1>{t('auth.login.title')}</h1>

        {senhaRedefinida && <div className="success-banner">{t('auth.login.passwordResetSuccess')}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            {t('auth.login.email')}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {t('auth.login.password')}
            <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <div className="auth-forgot">
            <Link to="/esqueci-senha">{t('auth.login.forgotPassword')}</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {t('auth.login.submit')}
          </button>
        </form>

        <p className="auth-switch">
          {t('auth.login.noAccount')} <Link to="/cadastro">{t('auth.login.signupLink')}</Link>
        </p>
      </div>
    </div>
  );
}
