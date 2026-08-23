import { useMemo } from 'react';
import {
  downsampleBurnTransactions,
  filterBurnTransactionsByRange,
  formatBurnChartSummary,
} from '../lib/burnView.js';
import type {
  BurnSummary,
  BurnTimeRange,
  BurnTransaction,
} from '../types/api.js';
interface BurnChartSeries {
  chartBurns: BurnTransaction[];
  chartSummary: string;
}

export function useBurnChartSeries(
  summary: BurnSummary | null,
  burns: BurnTransaction[],
  timeRange: BurnTimeRange,
): BurnChartSeries | null {
  return useMemo(() => {
    if (!summary) {
      return null;
    }

    const anchor =
      summary.latestBurnTimestamp ??
      burns.at(-1)?.timestamp ??
      Math.floor(Date.now() / 1000);
    const filteredBurns = filterBurnTransactionsByRange(
      burns,
      timeRange,
      anchor,
    );
    return {
      chartBurns: downsampleBurnTransactions(filteredBurns),
      chartSummary: formatBurnChartSummary(filteredBurns),
    };
  }, [burns, summary, timeRange]);
}
