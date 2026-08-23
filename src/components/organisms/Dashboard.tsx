import type { DashboardReadyState } from '../../types/dashboard.js';
import { BurnChart } from './BurnChart.js';
import { BurnHistory } from './BurnHistory.js';
import { DashboardHeader } from './DashboardHeader.js';
import { DashboardMetrics } from './DashboardMetrics.js';
import { Methodology } from './Methodology.js';

interface DashboardProps {
  dashboard: DashboardReadyState;
}

export function Dashboard({ dashboard }: DashboardProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-2 py-2 sm:px-4 sm:py-6">
        <DashboardHeader updatedText={dashboard.dataUpdatedText} />
        <DashboardMetrics metrics={dashboard.metrics} />
        <BurnChart
          chart={dashboard.chart}
          summaryText={dashboard.chartSummary}
          rangeOptions={dashboard.rangeOptions}
        />
        <BurnHistory
          rows={dashboard.tableRows}
          hasHistory={dashboard.hasHistory}
          hasMore={dashboard.hasMoreRows}
          onLoadMore={dashboard.onLoadMore}
        />
        <Methodology consistency={dashboard.consistency} />
      </div>
    </main>
  );
}
