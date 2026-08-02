import {
  buildBurnTransactions,
  calculateBurnSummary,
  calculateRemainingSupplyRaw,
  downsampleBurnTransactions,
  filterBurnTransactionsByRange,
  filterBurnTransactionsFromBlock,
  formatBurnChartSummary,
  groupBurnLogsByTransaction,
  reverseBurnTransactions,
  sortBurnTransactionsChronologically,
  toBurnChartPoints,
} from '../src/lib/burns.js';
import { AJNA_CONFIG } from '../src/lib/ajnaConfig.js';
import { formatCompactTokenAmount, formatPercentBurned } from '../src/lib/format.js';
import { buildAjnaBurnTransfersSql } from '../scripts/lib/fetchBurnLogs.js';
import {
  buildManyTransactions,
  originalSupplyRaw,
  sampleLogs,
  sampleTimestamps,
} from './fixtures/burn-fixtures.js';

const AJNA = 10n ** 18n;

describe('burn data helpers', () => {
  it('groups multiple burn logs by transaction and deduplicates repeated logs', () => {
    const groups = groupBurnLogsByTransaction(sampleLogs);

    expect(groups).toHaveLength(2);
    expect(groups[0].transactionHash).toBe(sampleLogs[0].transactionHash);
    expect(groups[0].amountBurnedRaw).toBe(3n * AJNA);
    expect(groups[1].transactionHash).toBe(sampleLogs[2].transactionHash);
    expect(groups[1].amountBurnedRaw).toBe(3n * AJNA);
  });

  it('builds chronological burn transactions with cumulative and remaining supply values', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, originalSupplyRaw);

    expect(transactions).toHaveLength(2);
    expect(transactions[0].cumulativeBurnedRaw).toBe((3n * AJNA).toString());
    expect(transactions[0].remainingSupplyRaw).toBe((7n * AJNA).toString());
    expect(transactions[1].cumulativeBurnedRaw).toBe((6n * AJNA).toString());
    expect(transactions[1].remainingSupplyRaw).toBe((4n * AJNA).toString());
    expect(transactions[1].amountBurnedFormatted).toBe('3 AJNA');
  });

  it('floors remaining supply at zero once burns exceed the launch baseline', () => {
    expect(calculateRemainingSupplyRaw(4n * AJNA, 6n * AJNA)).toBe(0n);

    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, 4n * AJNA);

    expect(transactions[0].remainingSupplyRaw).toBe((1n * AJNA).toString());
    expect(transactions[1].remainingSupplyRaw).toBe('0');
  });

  it('sorts and reverses burn transactions chronologically', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, originalSupplyRaw);
    const reversed = reverseBurnTransactions(transactions);
    const sorted = sortBurnTransactionsChronologically(reversed);

    expect(sorted.map((transaction) => transaction.transactionHash)).toEqual(
      transactions.map((transaction) => transaction.transactionHash),
    );
  });

  it('filters transactions by date range', () => {
    const transactions = buildManyTransactions(4);
    const latestTimestamp = transactions.at(-1)?.timestamp ?? 1_700_000_000;

    expect(filterBurnTransactionsByRange(transactions, '30d', latestTimestamp)).toHaveLength(1);
    expect(filterBurnTransactionsByRange(transactions, '90d', latestTimestamp)).toHaveLength(2);
    expect(filterBurnTransactionsByRange(transactions, '1y', latestTimestamp)).toHaveLength(3);
    expect(filterBurnTransactionsByRange(transactions, 'all', latestTimestamp)).toHaveLength(4);
  });

  it('downsamples long histories while preserving the final point', () => {
    const transactions = buildManyTransactions(240);
    const sampled = downsampleBurnTransactions(transactions, 50);

    expect(sampled.length).toBeLessThanOrEqual(50);
    expect(sampled[0].transactionHash).toBe(transactions[0].transactionHash);
    expect(sampled[sampled.length - 1].transactionHash).toBe(transactions[transactions.length - 1].transactionHash);
  });

  it('calculates summaries and consistency checks', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, originalSupplyRaw);
    const summary = calculateBurnSummary(
      transactions,
      1,
      '0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079',
      originalSupplyRaw,
      4n * AJNA,
      15478977,
      1662397146,
      '2026-08-02T12:00:00.000Z',
      15500000,
    );

    expect(summary.burnTransactionCount).toBe(2);
    expect(summary.indexedBurnTotalRaw).toBe((6n * AJNA).toString());
    expect(summary.calculatedBurnTotalRaw).toBe((6n * AJNA).toString());
    expect(summary.percentSupplyBurned).toBe('60.000%');
    expect(summary.dataConsistent).toBe(true);
    expect(summary.discrepancyRaw).toBe('0');
  });

  it('detects discrepancies between indexed burns and supply reduction', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, originalSupplyRaw);
    const summary = calculateBurnSummary(
      transactions,
      1,
      '0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079',
      originalSupplyRaw,
      5n * AJNA,
      15478977,
      1662397146,
      '2026-08-02T12:00:00.000Z',
      15500000,
    );

    expect(summary.dataConsistent).toBe(false);
    expect(summary.discrepancyRaw).toBe((-1n * AJNA).toString());
  });

  it('formats large numbers and percentages without floating-point math in calculations', () => {
    expect(formatCompactTokenAmount(1_000_000_000n * AJNA)).toBe('1B AJNA');
    expect(formatPercentBurned(3n * AJNA, 10n * AJNA)).toBe('30.000%');
    expect(formatPercentBurned(12n * AJNA, 10n * AJNA)).toBe('100.000%');
  });

  it('keeps summary supply at zero when indexed burns exceed the baseline', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, 4n * AJNA);
    const summary = calculateBurnSummary(
      transactions,
      1,
      '0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079',
      4n * AJNA,
      0n,
      15478977,
      1662397146,
      '2026-08-02T12:00:00.000Z',
      15500000,
    );

    expect(summary.currentTotalSupplyRaw).toBe('0');
    expect(summary.currentTotalSupplyFormatted).toBe('0 AJNA');
    expect(summary.percentSupplyBurned).toBe('100.000%');
    expect(summary.dataConsistent).toBe(false);
    expect(summary.discrepancyRaw).toBe((-2n * AJNA).toString());
  });

  it('handles empty histories cleanly', () => {
    expect(filterBurnTransactionsByRange([], 'all', 1_700_000_000)).toEqual([]);
    expect(downsampleBurnTransactions([])).toEqual([]);
    expect(formatBurnChartSummary([])).toBe('No AJNA burn transactions were found in the selected range.');
  });

  it('creates chart points with numeric values for Recharts', () => {
    const transactions = buildBurnTransactions(groupBurnLogsByTransaction(sampleLogs), sampleTimestamps, originalSupplyRaw);
    const points = toBurnChartPoints(transactions);

    expect(points[0].cumulativeBurnedValue).toBe(3);
    expect(points[1].remainingSupplyValue).toBe(4);
    expect(points[1].amountBurnedValue).toBe(3);
  });

  it('filters the visible chart series from the September 2023 baseline', () => {
    const transactions = buildManyTransactions(4);
    const filtered = filterBurnTransactionsFromBlock(transactions, transactions[2].blockNumber);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].blockNumber).toBe(transactions[2].blockNumber);
    expect(filtered[1].blockNumber).toBe(transactions[3].blockNumber);
  });

  it('keeps the Dune query on the visible September 2023 range', () => {
    const sql = buildAjnaBurnTransfersSql();

    expect(sql).toContain(`block_number >= ${AJNA_CONFIG.chartHistoryStartBlock}`);
    expect(sql).not.toContain(`block_number >= ${AJNA_CONFIG.deploymentBlock}`);
    expect(sql).toContain("contract_address = 0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079");
  });
});
