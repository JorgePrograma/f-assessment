const LOCALE = 'es';

const shortDate = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });
const longDateTime = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeStyle: 'short' });

export function formatDate(date: Date): string {
	return shortDate.format(date);
}

export function formatDateTime(date: Date): string {
	return longDateTime.format(date);
}

const integer = new Intl.NumberFormat(LOCALE);
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
	return integer.format(value);
}

/** Share of `part` in `total` (0 when there is no total), e.g. "48 %". */
export function formatShare(part: number, total: number): string {
	return percent.format(total === 0 ? 0 : part / total);
}
