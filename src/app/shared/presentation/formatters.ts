export type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const STATUS_SEVERITIES: Readonly<Record<string, Severity>> = Object.freeze({
  active: 'success',
  open: 'info',
  draft: 'secondary',
  pending: 'warn',
  counteroffer: 'warn',
  accepted: 'info',
  matched: 'success',
  rejected: 'danger',
  closed: 'secondary',
  cancelled: 'danger',
  picked_up: 'info',
  in_transit: 'info',
  delivered: 'success',
  paid: 'success',
  failed: 'danger'
});

const localeOf = (language: string | null | undefined): string => language === 'es' ? 'es-PE' : 'en-GB';

export const formatDate = (value: string | null | undefined, language?: string | null): string => {
  if (!value) return '—';
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return date.toLocaleDateString(localeOf(language), { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value: string | null | undefined, language?: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleString(localeOf(language), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (value: string | null | undefined, language?: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString(localeOf(language), { hour: '2-digit', minute: '2-digit' });
};

export const formatMoney = (amount: number | null | undefined, currency: string | null | undefined = 'PEN'): string => {
  const symbol = currency === 'USD' ? 'US$' : 'S/';
  return `${symbol} ${Number(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value: number | null | undefined): string =>
  Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 1 });

export const toIsoDate = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const fromIsoDate = (value: string | null | undefined): Date | null =>
  value ? new Date(`${value}T00:00:00`) : null;

export const initialsOf = (name: string | null | undefined): string => (name ?? '')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0].toUpperCase())
  .join('');

/** IN_TRANSIT becomes in-transit, the suffix of the statuses.* translation keys. */
export const statusKey = (status: string | null | undefined): string => (status ?? '').toLowerCase().replaceAll('_', '-');

export const statusSeverity = (status: string): Severity => STATUS_SEVERITIES[status] ?? 'secondary';

export const halfHourSlots = (fromHour = 6, toHour = 22): string[] => {
  const slots: string[] = [];
  for (let hour = fromHour; hour <= toHour; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < toHour) slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};
