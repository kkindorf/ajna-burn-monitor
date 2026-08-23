import type { RangeOptionView } from '../../types/dashboard.js';

interface RangeSelectorProps {
  options: RangeOptionView[];
}

export function RangeSelector({ options }: RangeSelectorProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-full border border-stone-300 bg-white/70 p-1"
      role="tablist"
      aria-label="Chart time range"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={option.onSelect}
          aria-pressed={option.isActive}
          className={option.className}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
