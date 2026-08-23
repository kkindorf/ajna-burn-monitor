import { formatUtcDate } from '../../lib/display.js';
import type { BurnSummary, BurnTransaction } from '../../types/burnSnapshot.js';
import { MetricCard } from '../atoms/MetricCard.js';

interface DashboardMetricsProps {
  summary: BurnSummary;
  latestBurn?: BurnTransaction;
}

export function DashboardMetrics({
  summary,
  latestBurn,
}: DashboardMetricsProps) {
  const latestBurnText = latestBurn
    ? `${latestBurn.amountBurnedFormatted} on ${formatUtcDate(latestBurn.timestamp)}`
    : 'No burn transactions yet';

  const metrics = [
    {
      label: 'Current supply',
      value: summary.currentTotalSupplyFormatted,
      exactValue: summary.currentTotalSupplyRaw,
    },
    {
      label: 'AJNA burned',
      value: summary.indexedBurnTotalFormatted,
      exactValue: summary.indexedBurnTotalRaw,
    },
    {
      label: '% of launch supply burned',
      value: summary.percentSupplyBurned,
    },
    {
      label: 'Burn transactions',
      value: summary.burnTransactionCount.toString(),
    },
    {
      label: 'Most recent burn',
      value: latestBurnText,
    },
  ];

  return (
    <section
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="AJNA burn metrics"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}
