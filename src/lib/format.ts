import { formatUnits } from 'viem';
import { AJNA_CONFIG } from './ajnaConfig.js';

function splitUnits(units: string): { negative: boolean; integer: string; fraction: string } {
  const negative = units.startsWith('-');
  const clean = negative ? units.slice(1) : units;
  const [integer = '0', fraction = ''] = clean.split('.');
  return { negative, integer, fraction };
}

function addThousandsSeparators(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function trimTrailingZeros(value: string): string {
  return value.replace(/0+$/, '');
}

function formatDecimalString(units: string, precision = 2): string {
  const { negative, integer, fraction } = splitUnits(units);
  const integerPart = addThousandsSeparators(integer);

  if (!fraction) {
    return `${negative ? '-' : ''}${integerPart}`;
  }

  const visibleFraction = trimTrailingZeros(fraction.slice(0, precision));
  if (!visibleFraction) {
    return `${negative ? '-' : ''}${integerPart}`;
  }

  return `${negative ? '-' : ''}${integerPart}.${visibleFraction}`;
}

function compactNumberFromUnits(units: string): string {
  const parsed = Number(units);
  if (!Number.isFinite(parsed)) {
    return units;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: parsed >= 100 ? 1 : 2,
  });
  return formatter.format(parsed);
}

export function formatExactTokenAmount(raw: bigint | string, decimals = AJNA_CONFIG.tokenDecimals, symbol = AJNA_CONFIG.tokenSymbol): string {
  const value = typeof raw === 'bigint' ? raw : BigInt(raw);
  return `${formatDecimalString(formatUnits(value, decimals), decimals)} ${symbol}`;
}

export function formatCompactTokenAmount(raw: bigint | string, decimals = AJNA_CONFIG.tokenDecimals, symbol = AJNA_CONFIG.tokenSymbol): string {
  const value = typeof raw === 'bigint' ? raw : BigInt(raw);
  return `${compactNumberFromUnits(formatUnits(value, decimals))} ${symbol}`;
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

export function formatCompactTokenValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 1 : 2,
  }).format(value);
}

export function formatPercentBurned(indexedBurnRaw: bigint, originalSupplyRaw: bigint): string {
  if (originalSupplyRaw === 0n) {
    return '0.000%';
  }

  const cappedBurnRaw = indexedBurnRaw > originalSupplyRaw ? originalSupplyRaw : indexedBurnRaw;
  const scaled = (cappedBurnRaw * 100_000n + originalSupplyRaw / 2n) / originalSupplyRaw;
  const whole = scaled / 1_000n;
  const fraction = (scaled % 1_000n).toString().padStart(3, '0');
  return `${whole.toString()}.${fraction}%`;
}

export function formatSignedRawDifference(rawDifference: bigint, decimals = AJNA_CONFIG.tokenDecimals): string {
  if (rawDifference === 0n) {
    return '0';
  }

  const negative = rawDifference < 0n;
  const absolute = negative ? -rawDifference : rawDifference;
  const formatted = formatDecimalString(formatUnits(absolute, decimals), decimals);
  return `${negative ? '-' : ''}${formatted}`;
}
