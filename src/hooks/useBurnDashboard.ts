import { useState } from 'react';
import {
  createBurnChartPoints,
  type BurnChartPoint,
  type BurnTimeRange,
} from '../lib/burnView.js';
import type { BurnSummary, BurnTransaction } from '../types/burnSnapshot.js';
import { useBurnData } from './useBurnData.js';

const ROWS_PER_PAGE = 25;

export interface DashboardReadyState {
  status: 'ready';
  summary: BurnSummary;
  chartPoints: BurnChartPoint[];
  timeRange: BurnTimeRange;
  onTimeRangeChange: (range: BurnTimeRange) => void;
  visibleBurns: BurnTransaction[];
  hasMoreBurns: boolean;
  onLoadMore: () => void;
}

type BurnDashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void }
  | DashboardReadyState;

export function useBurnDashboard(): BurnDashboardState {
  const burnData = useBurnData();
  const [timeRange, setTimeRange] = useState<BurnTimeRange>('all');
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);

  const loadMore = () => {
    setVisibleRows((current) => current + ROWS_PER_PAGE);
  };

  if (burnData.status === 'loading') {
    return { status: 'loading' };
  }

  if (burnData.status === 'error') {
    return {
      status: 'error',
      message: burnData.message,
      onRetry: burnData.retry,
    };
  }

  const { summary, burns } = burnData;
  const chartPoints = createBurnChartPoints(burns, timeRange);

  return {
    status: 'ready',
    summary,
    chartPoints,
    timeRange,
    onTimeRangeChange: setTimeRange,
    visibleBurns: burns.slice(-visibleRows).reverse(),
    hasMoreBurns: visibleRows < burns.length,
    onLoadMore: loadMore,
  };
}
