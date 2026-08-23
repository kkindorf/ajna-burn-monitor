import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BurnChartPoint, BurnTimeRange } from '../../lib/burnView.js';
import { formatCompactNumber, formatUtcDate } from '../../lib/display.js';
import { EmptyState } from '../atoms/EmptyState.js';
import { SectionHeading } from '../atoms/SectionHeading.js';
import { Surface } from '../atoms/Surface.js';
import { ChartTooltip } from '../molecules/ChartTooltip.js';
import { RangeSelector } from '../molecules/RangeSelector.js';

interface BurnChartProps {
  points: BurnChartPoint[];
  timeRange: BurnTimeRange;
  onTimeRangeChange: (range: BurnTimeRange) => void;
}

export function BurnChart({
  points,
  timeRange,
  onTimeRangeChange,
}: BurnChartProps) {
  const firstBurn = points[0];
  const lastBurn = points.at(-1);
  const chartSummary =
    firstBurn && lastBurn
      ? `Cumulative AJNA burned increased from ${firstBurn.cumulativeBurnedFormatted} on ${formatUtcDate(firstBurn.timestamp)} to ${lastBurn.cumulativeBurnedFormatted} on ${formatUtcDate(lastBurn.timestamp)}.`
      : null;

  return (
    <Surface className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Chart"
          title="Cumulative AJNA burned over time"
        />
        <RangeSelector value={timeRange} onChange={onTimeRangeChange} />
      </div>
      {chartSummary && <p className="text-sm text-stone-600">{chartSummary}</p>}
      {points.length === 0 ? (
        <EmptyState>
          No burn data is available for the selected range.
        </EmptyState>
      ) : (
        <div className="h-72 text-emerald-800 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              accessibilityLayer
              title="Cumulative AJNA burned over time"
              desc="Use the arrow keys to inspect burn totals by date."
            >
              <CartesianGrid className="stroke-stone-300" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => formatUtcDate(Number(timestamp))}
                minTickGap={28}
                className="fill-stone-600 text-xs"
              />
              <YAxis
                tickFormatter={formatCompactNumber}
                width={72}
                className="fill-stone-600 text-xs"
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulativeBurnedValue"
                className="stroke-current stroke-2"
                dot={false}
                isAnimationActive={false}
                name="Cumulative AJNA burned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Surface>
  );
}
