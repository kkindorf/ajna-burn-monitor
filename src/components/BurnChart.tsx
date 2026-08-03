import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { BurnTimeRange, BurnTransaction } from '../types/api.js';
import { formatCompactNumber, formatUtcDate, formatUtcDateTime } from '../lib/display.js';
import { toBurnChartPoints, type BurnChartPoint } from '../lib/burnView.js';

interface BurnChartProps {
  burns: BurnTransaction[];
  timeRange: BurnTimeRange;
  onTimeRangeChange: (range: BurnTimeRange) => void;
  summaryText: string;
}

const RANGE_OPTIONS: Array<{ value: BurnTimeRange; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '1y', label: '1 year' },
  { value: '90d', label: '90 days' },
  { value: '30d', label: '30 days' },
];

function BurnTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: BurnChartPoint }>;
}) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-title">{formatUtcDateTime(point.timestamp)} UTC</p>
      <dl className="chart-tooltip-list">
        <div>
          <dt>AJNA burned</dt>
          <dd title={`${point.amountBurnedRaw} raw`}>{point.amountBurnedFormatted}</dd>
        </div>
        <div>
          <dt>Cumulative AJNA burned</dt>
          <dd title={`${point.cumulativeBurnedRaw} raw`}>{point.cumulativeBurnedFormatted}</dd>
        </div>
        <div>
          <dt>Remaining total supply</dt>
          <dd title={`${point.remainingSupplyRaw} raw`}>{point.remainingSupplyFormatted}</dd>
        </div>
      </dl>
    </div>
  );
}

export function BurnChart({ burns, timeRange, onTimeRangeChange, summaryText }: BurnChartProps) {
  const chartPoints = toBurnChartPoints(burns);

  return (
    <section className="panel stack-gap">
      <div className="section-head">
        <div>
          <p className="section-label">Chart</p>
          <h2>Cumulative AJNA burned over time</h2>
        </div>
        <div className="range-switcher" role="tablist" aria-label="Chart time range">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === timeRange ? 'range-button active' : 'range-button'}
              onClick={() => onTimeRangeChange(option.value)}
              aria-pressed={option.value === timeRange}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted-copy">{summaryText}</p>
      {chartPoints.length > 0 ? (
        <div className="chart-frame" aria-label="Cumulative AJNA burned line chart">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartPoints} margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd3c5" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatUtcDate(Number(value))}
                minTickGap={28}
                stroke="#726b60"
              />
              <YAxis
                tickFormatter={formatCompactNumber}
                stroke="#726b60"
                width={72}
              />
              <Tooltip content={<BurnTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulativeBurnedValue"
                stroke="#1f6f5b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Cumulative AJNA burned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">
          <p>No burn data is available for the selected range.</p>
        </div>
      )}
    </section>
  );
}
