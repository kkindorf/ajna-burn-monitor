import {
  useChartTooltip,
  type ChartTooltipPayload,
} from '../../hooks/useChartTooltip.js';

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload;
}

export function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const tooltip = useChartTooltip(active, payload);

  if (!tooltip) {
    return null;
  }

  return (
    <div className="rounded-xl border border-stone-300 bg-white/95 px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-stone-900">{tooltip.title}</p>
      <dl className="grid gap-2">
        {tooltip.items.map((item) => (
          <div key={item.label} className="grid gap-0.5">
            <dt className="text-xs text-stone-600">{item.label}</dt>
            <dd className="font-semibold text-stone-900" title={item.title}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
