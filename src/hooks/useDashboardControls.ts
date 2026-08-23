import { useCallback, useState } from 'react';
import type { BurnTimeRange } from '../types/api.js';

const DEFAULT_VISIBLE_ROWS = 25;

export function useDashboardControls() {
  const [timeRange, setTimeRange] = useState<BurnTimeRange>('all');
  const [visibleRows, setVisibleRows] = useState(DEFAULT_VISIBLE_ROWS);

  const loadMore = useCallback(
    () => setVisibleRows((current) => current + DEFAULT_VISIBLE_ROWS),
    [],
  );
  const reset = useCallback(() => {
    setTimeRange('all');
    setVisibleRows(DEFAULT_VISIBLE_ROWS);
  }, []);

  return { timeRange, visibleRows, setTimeRange, loadMore, reset };
}
