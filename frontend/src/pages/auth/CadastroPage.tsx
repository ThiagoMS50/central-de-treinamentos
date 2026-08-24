import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/Logo';

export function CadastroPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.cadastro.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const resultado = await signUp(nome, email, password);
      if (resultado.needsEmailConfirmation) {
        setPrecisaConfirmarEmail(true);
      } else {
        navigate('/cursos', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (precisaConfirmarEmail) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo />
          </div>
          <p>{t('auth.cadastro.checkEmail')}</p>
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
        <h1>{t('auth.cadastro.title')}</h1>

        <form onSubmit={handleSubmit} className="form">
          <label>
            {t('auth.cadastro.nome')}
            <input required value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label>
            {t('auth.cadastro.email')}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {t('auth.cadastro.password')}
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            {t('auth.cadastro.confirmPassword')}
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {t('auth.cadastro.submit')}
          </button>
        </form>

        <p className="auth-switch">
          {t('auth.cadastro.hasAccount')} <Link to="/login">{t('auth.cadastro.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
