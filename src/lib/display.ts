const UTC_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const UTC_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 1 : 2,
  }).format(value);
}

export function formatUtcDate(timestampSeconds: number): string {
  return UTC_DATE_FORMATTER.format(new Date(timestampSeconds * 1000));
}

export function formatUtcDateTime(timestampSeconds: number): string {
  return UTC_DATE_TIME_FORMATTER.format(new Date(timestampSeconds * 1000));
}
