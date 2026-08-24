export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value) + '%';
}
