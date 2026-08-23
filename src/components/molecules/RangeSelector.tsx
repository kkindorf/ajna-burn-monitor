import type { BurnTimeRange } from '../../lib/burnView.js';

interface RangeSelectorProps {
  value: BurnTimeRange;
  onChange: (range: BurnTimeRange) => void;
}

const rangeOptions: Array<{ value: BurnTimeRange; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '1y', label: '1 year' },
  { value: '90d', label: '90 days' },
  { value: '30d', label: '30 days' },
];

const buttonClassName =
  'cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800';

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-full border border-stone-300 bg-white/70 p-1"
      role="group"
      aria-label="Chart time range"
    >
      {rangeOptions.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`${buttonClassName} ${
              isActive
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
