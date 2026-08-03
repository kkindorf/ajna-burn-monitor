const TOKEN_SCALE = 1_000_000_000_000_000_000;

function toBigIntValue(raw: bigint | string): bigint {
  return typeof raw === 'bigint' ? raw : BigInt(raw);
}

function formatCompactNumberValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 1 : 2,
  }).format(value);
}

function rawTokenAmountToNumber(raw: bigint | string): number {
  const parsed = Number(toBigIntValue(raw));
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed / TOKEN_SCALE;
}

export function formatCompactAjnaAmount(raw: bigint | string): string {
  return `${formatCompactNumberValue(rawTokenAmountToNumber(raw))} AJNA`;
}

export function formatUtcDate(timestampSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestampSeconds * 1000));
}

export function formatUtcDateTime(timestampSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(timestampSeconds * 1000));
}

export function formatCompactNumber(value: number): string {
  return formatCompactNumberValue(value);
}
