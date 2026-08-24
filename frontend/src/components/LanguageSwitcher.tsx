import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      className="language-switcher"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label="Idioma / Language / Idioma"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
