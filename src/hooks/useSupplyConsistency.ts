import { useMemo } from 'react';
import { formatCompactAjnaAmount } from '../lib/display.js';

function getConsistencyMessage(
  dataConsistent: boolean,
  discrepancyRaw: string,
) {
  if (dataConsistent) {
    return 'Indexed burn totals match the observed reduction in total supply.';
  }

  const discrepancy = BigInt(discrepancyRaw);
  const magnitude = formatCompactAjnaAmount(
    discrepancy < 0n ? -discrepancy : discrepancy,
  );
  return discrepancy < 0n
    ? `Indexed burn totals exceed the observed reduction in total supply by ${magnitude}.`
    : `Indexed burn totals trail the observed reduction in total supply by ${magnitude}.`;
}

export function useSupplyConsistency(
  dataConsistent: boolean,
  discrepancyRaw: string,
) {
  return useMemo(
    () => ({
      message: getConsistencyMessage(dataConsistent, discrepancyRaw),
      className: dataConsistent
        ? 'bg-emerald-800/10 text-emerald-800'
        : 'bg-amber-900/10 text-amber-900',
    }),
    [dataConsistent, discrepancyRaw],
  );
}
