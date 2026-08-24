import { useTranslation } from 'react-i18next';

export function Spinner() {
  const { t } = useTranslation();
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{t('common.loading')}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}

export function ErrorBanner({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="error-banner">
      <span>{message ?? t('common.error')}</span>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
