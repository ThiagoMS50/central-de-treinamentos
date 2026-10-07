import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lms_language',
    },
    interpolation: { escapeValue: false },
  });

// Mantém o lang do <html> igual ao idioma escolhido, pra o navegador não achar que a página
// está em outro idioma e oferecer tradução automática.
// O título da aba (nome do sistema) também acompanha o idioma.
const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng === 'pt' ? 'pt-BR' : lng;
  document.title = i18n.t('app.name');
};
syncHtmlLang(i18n.resolvedLanguage ?? 'pt');
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
