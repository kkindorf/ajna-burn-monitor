import { MetricCard } from '../atoms/MetricCard.js';
import type { DashboardMetric } from '../../types/dashboard.js';

interface DashboardMetricsProps {
  metrics: DashboardMetric[];
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
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
