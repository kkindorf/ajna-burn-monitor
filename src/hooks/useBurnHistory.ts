import { useMemo } from 'react';
import { reverseBurnTransactions } from '../lib/burnView.js';
import type { BurnTransaction } from '../types/api.js';
import type {
  BurnHistoryRow,
  DashboardReadyState,
} from '../types/dashboard.js';

type BurnHistory = Pick<
  DashboardReadyState,
  'tableRows' | 'hasHistory' | 'hasMoreRows'
>;

function toBurnHistoryRow(burn: BurnTransaction): BurnHistoryRow {
  return {
    id: burn.transactionHash,
    date: burn.date,
    dateTime: `${burn.date}T00:00:00Z`,
    dateTitle: new Date(burn.timestamp * 1000).toUTCString(),
    amountBurned: burn.amountBurnedFormatted,
    amountBurnedTitle: `${burn.amountBurnedRaw} raw`,
    cumulativeBurned: burn.cumulativeBurnedFormatted,
    cumulativeBurnedTitle: `${burn.cumulativeBurnedRaw} raw`,
    remainingSupply: burn.remainingSupplyFormatted,
    remainingSupplyTitle: `${burn.remainingSupplyRaw} raw`,
    transactionUrl: burn.etherscanUrl,
    transactionLabel: `View transaction ${burn.transactionHash} on Etherscan`,
  };
}

export function useBurnHistory(
  burns: BurnTransaction[],
  visibleRows: number,
): BurnHistory {
  return useMemo(() => {
    const tableRows = reverseBurnTransactions(burns)
      .slice(0, visibleRows)
      .map(toBurnHistoryRow);
    return {
      tableRows,
      hasHistory: tableRows.length > 0,
      hasMoreRows: visibleRows < burns.length,
    };
  }, [burns, visibleRows]);
}
