import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../components/Logo';
import { apiFetch, ApiError } from '../../lib/apiClient';

export function EsqueciSenhaPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/auth/esqueci-senha', {
        method: 'POST',
        body: { email, redirectTo: `${window.location.origin}/redefinir-senha` },
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(t('auth.esqueciSenha.notFound'));
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo />
          </div>
          <div className="success-banner">{t('auth.esqueciSenha.success')}</div>
          <p className="auth-switch">
            <Link to="/login">{t('auth.esqueciSenha.backToLogin')}</Link>
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
        <h1>{t('auth.esqueciSenha.title')}</h1>
        <p className="hint-text">{t('auth.esqueciSenha.instructions')}</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            {t('auth.esqueciSenha.email')}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {t('auth.esqueciSenha.submit')}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">{t('auth.esqueciSenha.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
}
