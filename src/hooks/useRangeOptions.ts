import { useMemo } from 'react';
import type { BurnTimeRange } from '../types/api.js';
import type { RangeOptionView } from '../types/dashboard.js';

interface RangeOption {
  value: BurnTimeRange;
  label: string;
}

const options: RangeOption[] = [
  { value: 'all', label: 'All' },
  { value: '1y', label: '1 year' },
  { value: '90d', label: '90 days' },
  { value: '30d', label: '30 days' },
];

const buttonClassName =
  'cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800';

export function useRangeOptions(
  value: BurnTimeRange,
  onChange: (range: BurnTimeRange) => void,
): RangeOptionView[] {
  return useMemo(
    () =>
      options.map((option) => ({
        ...option,
        isActive: option.value === value,
        className: `${buttonClassName} ${option.value === value ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`,
        onSelect: () => onChange(option.value),
      })),
    [onChange, value],
  );
}
