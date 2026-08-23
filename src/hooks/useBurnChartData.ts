import { useMemo } from 'react';
import { toBurnChartPoints } from '../lib/burnView.js';
import { formatCompactNumber, formatUtcDate } from '../lib/display.js';
import type { BurnTransaction } from '../types/api.js';
import type { BurnChartData } from '../types/dashboard.js';

export function useBurnChartData(burns: BurnTransaction[]): BurnChartData {
  return useMemo(() => {
    const points = toBurnChartPoints(burns);
    return {
      points,
      hasData: points.length > 0,
      dateTickFormatter: (value) => formatUtcDate(Number(value)),
      valueTickFormatter: formatCompactNumber,
    };
  }, [burns]);
}
