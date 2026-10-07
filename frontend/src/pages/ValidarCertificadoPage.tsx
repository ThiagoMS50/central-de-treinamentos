import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Icon } from '../components/ui/Icon';
import { Spinner } from '../components/ui/Feedback';
import { apiFetch, ApiError } from '../lib/apiClient';
import { formatDate } from '../lib/format';

interface CertificadoValido {
  nomeAluno: string;
  tipo: 'curso' | 'trilha';
  titulo: string;
  emitidoEm: string;
}

type Resultado = { estado: 'valido'; dados: CertificadoValido } | { estado: 'invalido' } | { estado: 'erro' } | null;

// Página pública (sem login) aberta pelo QR code do certificado: confirma se o código existe e
// mostra a quem e a que curso/trilha ele pertence. Também permite digitar um código à mão.
export function ValidarCertificadoPage() {
  const { t, i18n } = useTranslation();
  const { codigo: codigoDaUrl } = useParams<{ codigo?: string }>();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState(codigoDaUrl ?? '');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);

  useEffect(() => {
    if (!codigoDaUrl) {
      setResultado(null);
      return;
    }
    setCodigo(codigoDaUrl);
    let ativo = true;
    setCarregando(true);
    apiFetch<CertificadoValido>(`/certificados/validar/${encodeURIComponent(codigoDaUrl)}`)
      .then((dados) => ativo && setResultado({ estado: 'valido', dados }))
      .catch((err) => ativo && setResultado(err instanceof ApiError && err.status === 404 ? { estado: 'invalido' } : { estado: 'erro' }))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [codigoDaUrl]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const limpo = codigo.trim().toUpperCase();
    if (limpo) navigate(`/validar/${encodeURIComponent(limpo)}`);
  }

  return (
    <div className="auth-page">
      <div className="auth-card validar">
        <div className="auth-logo">
          <Logo />
          <LanguageSwitcher />
        </div>
        <h1>{t('validar.title')}</h1>
        <p className="validar-intro">{t('validar.intro')}</p>

        <form onSubmit={handleSubmit} className="validar-form">
          <input
            aria-label={t('validar.codeLabel')}
            placeholder="Ex.: A1B2C3D4E5"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoFocus={!codigoDaUrl}
          />
          <button type="submit" className="btn btn-primary" disabled={!codigo.trim() || carregando}>
            {t('validar.submit')}
          </button>
        </form>

        {carregando && <Spinner />}

        {!carregando && resultado?.estado === 'valido' && (
          <div className="validar-resultado validar-ok" role="status">
            <div className="validar-resultado-topo">
              <span className="validar-selo" aria-hidden="true">
                <Icon name="check" size={20} />
              </span>
              <div>
                <strong>{t('validar.validTitle')}</strong>
                <span>{t('validar.validBody')}</span>
              </div>
            </div>
            <dl className="validar-dados">
              <dt>{t('validar.holder')}</dt>
              <dd>{resultado.dados.nomeAluno}</dd>
              <dt>{resultado.dados.tipo === 'trilha' ? t('validar.track') : t('validar.course')}</dt>
              <dd>{resultado.dados.titulo}</dd>
              <dt>{t('validar.issuedAt')}</dt>
              <dd>{formatDate(resultado.dados.emitidoEm, i18n.language)}</dd>
              <dt>{t('validar.code')}</dt>
              <dd className="validar-codigo">{codigoDaUrl}</dd>
            </dl>
          </div>
        )}

        {!carregando && resultado?.estado === 'invalido' && (
          <div className="validar-resultado validar-falha" role="status">
            <div className="validar-resultado-topo">
              <span className="validar-selo" aria-hidden="true">
                <Icon name="close" size={20} />
              </span>
              <div>
                <strong>{t('validar.invalidTitle')}</strong>
                <span>{t('validar.invalidBody')}</span>
              </div>
            </div>
          </div>
        )}

        {!carregando && resultado?.estado === 'erro' && <div className="error-banner">{t('common.error')}</div>}
      </div>
    </div>
  );
}
