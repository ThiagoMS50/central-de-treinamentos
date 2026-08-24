import { useState } from 'react';
import { BRAND } from '../theme/brand';

// Enquanto não existe um logo.svg real (marca da empresa ainda não definida), cai automaticamente
// para um wordmark em texto — basta colocar o arquivo em public/logo.svg depois, sem mudar código.
export function Logo() {
  const [falhouCarregar, setFalhouCarregar] = useState(false);

  if (falhouCarregar) {
    return <span className="logo-wordmark">{BRAND.appName}</span>;
  }

  return (
    <img
      src={BRAND.logoSrc}
      alt={BRAND.appName}
      className="logo-image"
      onError={() => setFalhouCarregar(true)}
    />
  );
}
