import type { BurnTimeRange, BurnTransaction } from '../types/api.js';

const SECONDS_PER_DAY = 24 * 60 * 60;
const TOKEN_SCALE = 1_000_000_000_000_000_000;

export interface BurnChartPoint extends BurnTransaction {
  cumulativeBurnedValue: number;
  remainingSupplyValue: number;
  amountBurnedValue: number;
}

function rawTokenAmountToNumber(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed / TOKEN_SCALE;
}

export function reverseBurnTransactions(transactions: BurnTransaction[]): BurnTransaction[] {
  return [...transactions].sort((left, right) => {
    if (left.timestamp !== right.timestamp) {
      return right.timestamp - left.timestamp;
    }
    if (left.blockNumber !== right.blockNumber) {
      return right.blockNumber - left.blockNumber;
    }
    return right.transactionHash.localeCompare(left.transactionHash);
  });
}

export function filterBurnTransactionsByRange(
  transactions: BurnTransaction[],
  range: BurnTimeRange,
  anchorTimestampSeconds: number,
): BurnTransaction[] {
  if (range === 'all') {
    return [...transactions];
  }

  const days = range === '1y' ? 365 : range === '90d' ? 90 : 30;
  const cutoff = anchorTimestampSeconds - days * SECONDS_PER_DAY;
  return transactions.filter((transaction) => transaction.timestamp >= cutoff);
}

export function downsampleBurnTransactions(transactions: BurnTransaction[], maxPoints = 180): BurnTransaction[] {
  if (transactions.length <= maxPoints) {
    return [...transactions];
  }

  const step = Math.ceil(transactions.length / maxPoints);
  const sampled = transactions.filter((_, index) => index % step === 0);
  const last = transactions[transactions.length - 1];

  if (sampled[sampled.length - 1]?.transactionHash !== last.transactionHash) {
    sampled.push(last);
  }

  return sampled;
}

export function formatBurnChartSummary(transactions: BurnTransaction[]): string {
  if (transactions.length === 0) {
    return 'No AJNA burn transactions were found in the selected range.';
  }

  const first = transactions[0];
  const last = transactions[transactions.length - 1];
  return `Cumulative AJNA burned increased from ${first.cumulativeBurnedFormatted} on ${first.date} to ${last.cumulativeBurnedFormatted} on ${last.date}.`;
}

export function toBurnChartPoints(transactions: BurnTransaction[]): BurnChartPoint[] {
  return transactions.map((transaction) => ({
    ...transaction,
    cumulativeBurnedValue: rawTokenAmountToNumber(transaction.cumulativeBurnedRaw),
    remainingSupplyValue: rawTokenAmountToNumber(transaction.remainingSupplyRaw),
    amountBurnedValue: rawTokenAmountToNumber(transaction.amountBurnedRaw),
  }));
}
