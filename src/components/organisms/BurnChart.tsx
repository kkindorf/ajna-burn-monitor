import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BurnChartData, RangeOptionView } from '../../types/dashboard.js';
import { EmptyState } from '../atoms/EmptyState.js';
import { SectionHeading } from '../atoms/SectionHeading.js';
import { Surface } from '../atoms/Surface.js';
import { ChartTooltip } from '../molecules/ChartTooltip.js';
import { RangeSelector } from '../molecules/RangeSelector.js';

interface BurnChartProps {
  chart: BurnChartData;
  summaryText: string;
  rangeOptions: RangeOptionView[];
}

export function BurnChart({
  chart,
  summaryText,
  rangeOptions,
}: BurnChartProps) {
  return (
    <Surface className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Chart"
          title="Cumulative AJNA burned over time"
        />
        <RangeSelector options={rangeOptions} />
      </div>
      <p className="text-sm text-stone-600">{summaryText}</p>
      {chart.hasData ? (
        <div
          className="h-72 text-emerald-800 sm:h-80"
          aria-label="Cumulative AJNA burned line chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.points}>
              <CartesianGrid className="stroke-stone-300" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={chart.dateTickFormatter}
                minTickGap={28}
                className="fill-stone-600 text-xs"
              />
              <YAxis
                tickFormatter={chart.valueTickFormatter}
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
      ) : (
        <EmptyState>
          No burn data is available for the selected range.
        </EmptyState>
      )}
    </Surface>
  );
}
