import type { BurnChartPoint } from '../../lib/burnView.js';
import { formatUtcDateTime } from '../../lib/display.js';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: BurnChartPoint }>;
}

export function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const point = active ? payload?.[0]?.payload : undefined;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-stone-300 bg-white/95 px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-stone-900">
        {formatUtcDateTime(point.timestamp)} UTC
      </p>
      <dl className="grid gap-2">
        <div className="grid gap-0.5">
          <dt className="text-xs text-stone-600">AJNA burned</dt>
          <dd
            className="font-semibold text-stone-900"
            title={`${point.amountBurnedRaw} raw`}
          >
            {point.amountBurnedFormatted}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-xs text-stone-600">Cumulative AJNA burned</dt>
          <dd
            className="font-semibold text-stone-900"
            title={`${point.cumulativeBurnedRaw} raw`}
          >
            {point.cumulativeBurnedFormatted}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-xs text-stone-600">Remaining total supply</dt>
          <dd
            className="font-semibold text-stone-900"
            title={`${point.remainingSupplyRaw} raw`}
          >
            {point.remainingSupplyFormatted}
          </dd>
        </div>
      </dl>
    </div>
  );
}
