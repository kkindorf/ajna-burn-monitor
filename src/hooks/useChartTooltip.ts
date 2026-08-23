import { useMemo } from 'react';
import type { BurnChartPoint } from '../lib/burnView.js';
import { formatUtcDateTime } from '../lib/display.js';

export type ChartTooltipPayload = Array<{ payload?: BurnChartPoint }>;

interface ChartTooltipView {
  title: string;
  items: Array<{ label: string; value: string; title: string }>;
}

export function useChartTooltip(
  active?: boolean,
  payload?: ChartTooltipPayload,
): ChartTooltipView | null {
  return useMemo(() => {
    const point = active ? payload?.[0]?.payload : undefined;

    if (!point) {
      return null;
    }

    return {
      title: `${formatUtcDateTime(point.timestamp)} UTC`,
      items: [
        {
          label: 'AJNA burned',
          value: point.amountBurnedFormatted,
          title: `${point.amountBurnedRaw} raw`,
        },
        {
          label: 'Cumulative AJNA burned',
          value: point.cumulativeBurnedFormatted,
          title: `${point.cumulativeBurnedRaw} raw`,
        },
        {
          label: 'Remaining total supply',
          value: point.remainingSupplyFormatted,
          title: `${point.remainingSupplyRaw} raw`,
        },
      ],
    };
  }, [active, payload]);
}
