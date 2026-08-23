import { useCallback, useMemo } from 'react';
import type { BurnTransaction } from '../types/api.js';
import type { DashboardReadyState } from '../types/dashboard.js';
import { useBurnChartData } from './useBurnChartData.js';
import { useBurnChartSeries } from './useBurnChartSeries.js';
import { useBurnData } from './useBurnData.js';
import { useBurnHistory } from './useBurnHistory.js';
import { useDashboardControls } from './useDashboardControls.js';
import { useDashboardSummary } from './useDashboardSummary.js';
import { useRangeOptions } from './useRangeOptions.js';
import { useSupplyConsistency } from './useSupplyConsistency.js';

const EMPTY_BURNS: BurnTransaction[] = [];

export type BurnDashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void }
  | DashboardReadyState;

export function useBurnDashboard(): BurnDashboardState {
  const burnData = useBurnData();
  const retryBurnData = burnData.retry;
  const { timeRange, visibleRows, setTimeRange, loadMore, reset } =
    useDashboardControls();
  const summary = burnData.status === 'ready' ? burnData.summary : null;
  const burns = burnData.status === 'ready' ? burnData.burns : EMPTY_BURNS;
  const summaryValues = useDashboardSummary(summary);
  const chartValues = useBurnChartSeries(summary, burns, timeRange);
  const chart = useBurnChartData(chartValues?.chartBurns ?? EMPTY_BURNS);
  const history = useBurnHistory(burns, visibleRows);
  const rangeOptions = useRangeOptions(timeRange, setTimeRange);
  const consistency = useSupplyConsistency(
    summary?.dataConsistent ?? true,
    summary?.discrepancyRaw ?? '0',
  );
  const retry = useCallback(() => {
    reset();
    retryBurnData();
  }, [reset, retryBurnData]);
  const readyDashboard = useMemo(() => {
    if (!summary || !summaryValues || !chartValues) {
      return null;
    }

    return {
      status: 'ready' as const,
      ...summaryValues,
      chart,
      chartSummary: chartValues.chartSummary,
      rangeOptions,
      ...history,
      onLoadMore: loadMore,
      consistency,
    };
  }, [
    chart,
    chartValues,
    consistency,
    history,
    loadMore,
    rangeOptions,
    summary,
    summaryValues,
  ]);

  if (burnData.status === 'loading') {
    return { status: 'loading' };
  }

  if (burnData.status === 'error') {
    return { status: 'error', message: burnData.message, onRetry: retry };
  }

  if (!readyDashboard) {
    return { status: 'loading' };
  }

  return readyDashboard;
}
