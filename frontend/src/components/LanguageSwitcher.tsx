import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { Icon } from './ui/Icon';
import { marcarMissao } from '../lib/missoes';

// Cada idioma aparece no próprio idioma, para quem não entende o atual achar o seu.
const LANGUAGES = [
  { code: 'pt', short: 'PT', label: 'Português' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'es', short: 'ES', label: 'Español' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const atual = LANGUAGES.find((l) => i18n.resolvedLanguage === l.code) ?? LANGUAGES[0];

  return (
    <Dropdown
      label="Idioma / Language / Idioma"
      triggerClassName="pill-button"
      trigger={
        <>
          <Icon name="globe" size={16} />
          {atual.short}
        </>
      }
    >
      {(close) =>
        LANGUAGES.map((lang) => (
          <DropdownItem
            key={lang.code}
            selected={lang.code === atual.code}
            icon={<span className="dropdown-item-code">{lang.short}</span>}
            onSelect={() => {
              i18n.changeLanguage(lang.code);
              marcarMissao('personalizar');
              close();
            }}
          >
            {lang.label}
          </DropdownItem>
        ))
      }
    </Dropdown>
  );
}
