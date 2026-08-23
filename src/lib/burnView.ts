import type { BurnTransaction } from '../types/burnSnapshot.js';

const SECONDS_PER_DAY = 24 * 60 * 60;
const RAW_UNITS_PER_AJNA = 1_000_000_000_000_000_000;

export type BurnTimeRange = 'all' | '1y' | '90d' | '30d';

const DAYS_BY_RANGE = {
  '1y': 365,
  '90d': 90,
  '30d': 30,
} satisfies Record<Exclude<BurnTimeRange, 'all'>, number>;

export interface BurnChartPoint extends BurnTransaction {
  cumulativeBurnedValue: number;
}

export function createBurnChartPoints(
  transactions: BurnTransaction[],
  range: BurnTimeRange,
): BurnChartPoint[] {
  const latestTimestamp = transactions.at(-1)?.timestamp;
  const chartTransactions =
    range === 'all' || latestTimestamp === undefined
      ? transactions
      : transactions.filter(
          (transaction) =>
            transaction.timestamp >=
            latestTimestamp - DAYS_BY_RANGE[range] * SECONDS_PER_DAY,
        );

  return chartTransactions.map((transaction) => ({
    ...transaction,
    cumulativeBurnedValue:
      Number(transaction.cumulativeBurnedRaw) / RAW_UNITS_PER_AJNA,
  }));
}
