import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/brand';

// Enquanto não existe um logo.svg real (marca da empresa ainda não definida), cai automaticamente
// para um wordmark em texto — basta colocar o arquivo em public/logo.svg depois, sem mudar código.
export function Logo() {
  const { t } = useTranslation();
  const [falhouCarregar, setFalhouCarregar] = useState(false);

  if (falhouCarregar) {
    return <span className="logo-wordmark">{t('app.name')}</span>;
  }

  return <img src={BRAND.logoSrc} alt={t('app.name')} className="logo-image" onError={() => setFalhouCarregar(true)} />;
}
