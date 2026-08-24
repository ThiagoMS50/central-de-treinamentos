import { useTranslation } from 'react-i18next';
import { useTour } from '../hooks/useTour';

export function OnboardingTour() {
  const { t } = useTranslation();
  const { open, stepIndex, steps, next, prev, skip } = useTour();

  if (!open) return null;

  const stepKey = steps[stepIndex].key;
  const ultimoPasso = stepIndex === steps.length - 1;

  return (
    <div className="tour-overlay" role="dialog" aria-live="polite">
      <div className="tour-card">
        <span className="tour-step-counter">
          {t('tour.stepCounter', { current: stepIndex + 1, total: steps.length })}
        </span>
        <h2>{t(`tour.steps.${stepKey}.title`)}</h2>
        <p>{t(`tour.steps.${stepKey}.body`)}</p>
        <div className="tour-actions">
          <button type="button" className="btn btn-secondary" onClick={skip}>
            {t('tour.skip')}
          </button>
          <div className="tour-nav">
            {stepIndex > 0 && (
              <button type="button" className="btn btn-secondary" onClick={prev}>
                {t('tour.prev')}
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={next}>
              {ultimoPasso ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
