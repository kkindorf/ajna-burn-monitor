import { formatUtcDateTime } from './display.js';
import type { BurnSummary } from '../types/api.js';
import type { DashboardMetric } from '../types/dashboard.js';

export function createDashboardMetrics(
  summary: BurnSummary,
): DashboardMetric[] {
  const latestBurn =
    summary.latestBurnTimestamp && summary.latestBurnAmountFormatted
      ? `${summary.latestBurnAmountFormatted} on ${new Date(
          summary.latestBurnTimestamp * 1000,
        ).toLocaleDateString('en-US', {
          timeZone: 'UTC',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : 'No burn transactions yet';

  const metrics = [
    [
      'Current supply',
      summary.currentTotalSupplyFormatted,
      summary.currentTotalSupplyRaw,
    ],
    [
      'AJNA burned',
      summary.indexedBurnTotalFormatted,
      summary.indexedBurnTotalRaw,
    ],
    [
      '% of launch supply burned',
      summary.percentSupplyBurned,
      summary.percentSupplyBurned,
    ],
    [
      'Burn transactions',
      summary.burnTransactionCount.toString(),
      summary.burnTransactionCount.toString(),
    ],
    ['Most recent burn', latestBurn, latestBurn],
  ] as const;

  return metrics.map(([label, value, exactValue]) => ({
    label,
    value,
    accessibilityLabel: `${label}: ${exactValue}`,
  }));
}

export function getDataUpdatedText(generatedAt: string): string {
  const timestamp = Math.floor(new Date(generatedAt).getTime() / 1000);
  return Number.isNaN(timestamp)
    ? 'Not yet synced'
    : `Updated ${formatUtcDateTime(timestamp)} UTC`;
}
