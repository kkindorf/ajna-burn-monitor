import { useMemo } from 'react';
import {
  createDashboardMetrics,
  getDataUpdatedText,
} from '../lib/dashboardView.js';
import type { BurnSummary } from '../types/api.js';
import type { DashboardReadyState } from '../types/dashboard.js';

type DashboardSummary = Pick<
  DashboardReadyState,
  'metrics' | 'dataUpdatedText'
>;

export function useDashboardSummary(
  summary: BurnSummary | null,
): DashboardSummary | null {
  return useMemo(
    () =>
      summary && {
        metrics: createDashboardMetrics(summary),
        dataUpdatedText: getDataUpdatedText(summary.generatedAt),
      },
    [summary],
  );
}
