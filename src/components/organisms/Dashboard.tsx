import type { DashboardReadyState } from '../../hooks/useBurnDashboard.js';
import { BurnChart } from './BurnChart.js';
import { BurnHistory } from './BurnHistory.js';
import { DashboardHeader } from './DashboardHeader.js';
import { DashboardMetrics } from './DashboardMetrics.js';
import { DashboardShell } from './DashboardShell.js';
import { Methodology } from './Methodology.js';

interface DashboardProps {
  dashboard: DashboardReadyState;
}

export function Dashboard({ dashboard }: DashboardProps) {
  return (
    <DashboardShell>
      <DashboardHeader generatedAt={dashboard.summary.generatedAt} />
      <DashboardMetrics
        summary={dashboard.summary}
        latestBurn={dashboard.visibleBurns[0]}
      />
      <BurnChart
        points={dashboard.chartPoints}
        timeRange={dashboard.timeRange}
        onTimeRangeChange={dashboard.onTimeRangeChange}
      />
      <BurnHistory
        rows={dashboard.visibleBurns}
        hasMore={dashboard.hasMoreBurns}
        onLoadMore={dashboard.onLoadMore}
      />
      <Methodology />
    </DashboardShell>
  );
}
