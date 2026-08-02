import { formatUnits } from 'viem';
import type {
  BurnChartPoint,
  BurnLogRecord,
  BurnSummary,
  BurnTimeRange,
  BurnTransaction,
} from '../types/burn.js';
import { AJNA_CONFIG, buildEtherscanTxUrl } from './ajnaConfig.js';
import {
  formatCompactTokenAmount,
  formatPercentBurned,
  formatUtcDate,
} from './format.js';

function toSortedDedupedLogs(logs: BurnLogRecord[]): BurnLogRecord[] {
  const seen = new Set<string>();
  const deduped: BurnLogRecord[] = [];

  for (const log of logs) {
    const key = `${log.transactionHash}:${log.logIndex}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(log);
  }

  deduped.sort((left, right) => {
    if (left.blockNumber !== right.blockNumber) {
      return left.blockNumber - right.blockNumber;
    }
    if (left.logIndex !== right.logIndex) {
      return left.logIndex - right.logIndex;
    }
    return left.transactionHash.localeCompare(right.transactionHash);
  });

  return deduped;
}

export interface BurnGroup {
  transactionHash: `0x${string}`;
  blockNumber: number;
  timestamp: number;
  amountBurnedRaw: bigint;
  logIndex: number;
}

export function calculateRemainingSupplyRaw(originalSupplyRaw: bigint, burnedRaw: bigint): bigint {
  const remainingSupplyRaw = originalSupplyRaw - burnedRaw;
  return remainingSupplyRaw > 0n ? remainingSupplyRaw : 0n;
}

export function filterBurnTransactionsFromBlock(
  transactions: BurnTransaction[],
  minimumBlockNumber: number,
): BurnTransaction[] {
  return transactions.filter((transaction) => transaction.blockNumber >= minimumBlockNumber);
}

export function groupBurnLogsByTransaction(logs: BurnLogRecord[]): BurnGroup[] {
  const grouped = new Map<string, BurnGroup>();

  for (const log of toSortedDedupedLogs(logs)) {
    const existing = grouped.get(log.transactionHash);
    if (!existing) {
      grouped.set(log.transactionHash, {
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: 0,
        amountBurnedRaw: log.amountBurnedRaw,
        logIndex: log.logIndex,
      });
      continue;
    }

    existing.amountBurnedRaw += log.amountBurnedRaw;
    existing.logIndex = Math.min(existing.logIndex, log.logIndex);
    existing.blockNumber = Math.min(existing.blockNumber, log.blockNumber);
  }

  return [...grouped.values()].sort((left, right) => {
    if (left.blockNumber !== right.blockNumber) {
      return left.blockNumber - right.blockNumber;
    }
    if (left.logIndex !== right.logIndex) {
      return left.logIndex - right.logIndex;
    }
    return left.transactionHash.localeCompare(right.transactionHash);
  });
}

export function buildBurnTransactions(
  burnGroups: BurnGroup[],
  timestampsByBlock: Map<number, number>,
  originalSupplyRaw: bigint,
): BurnTransaction[] {
  const ordered = [...burnGroups].sort((left, right) => {
    if (left.blockNumber !== right.blockNumber) {
      return left.blockNumber - right.blockNumber;
    }
    if (left.logIndex !== right.logIndex) {
      return left.logIndex - right.logIndex;
    }
    return left.transactionHash.localeCompare(right.transactionHash);
  });

  let cumulativeBurnedRaw = 0n;

  return ordered.map((burn) => {
    cumulativeBurnedRaw += burn.amountBurnedRaw;
    const remainingSupplyRaw = calculateRemainingSupplyRaw(originalSupplyRaw, cumulativeBurnedRaw);
    const timestamp = timestampsByBlock.get(burn.blockNumber);

    if (typeof timestamp !== 'number') {
      throw new Error(`Missing timestamp for block ${burn.blockNumber}`);
    }

    return {
      transactionHash: burn.transactionHash,
      blockNumber: burn.blockNumber,
      timestamp,
      date: formatUtcDate(timestamp),
      amountBurnedRaw: burn.amountBurnedRaw.toString(),
      amountBurnedFormatted: formatCompactTokenAmount(burn.amountBurnedRaw),
      cumulativeBurnedRaw: cumulativeBurnedRaw.toString(),
      cumulativeBurnedFormatted: formatCompactTokenAmount(cumulativeBurnedRaw),
      remainingSupplyRaw: remainingSupplyRaw.toString(),
      remainingSupplyFormatted: formatCompactTokenAmount(remainingSupplyRaw),
      etherscanUrl: buildEtherscanTxUrl(burn.transactionHash),
    };
  });
}

export function sortBurnTransactionsChronologically(transactions: BurnTransaction[]): BurnTransaction[] {
  return [...transactions].sort((left, right) => {
    if (left.timestamp !== right.timestamp) {
      return left.timestamp - right.timestamp;
    }
    if (left.blockNumber !== right.blockNumber) {
      return left.blockNumber - right.blockNumber;
    }
    return left.transactionHash.localeCompare(right.transactionHash);
  });
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
  const cutoff = anchorTimestampSeconds - days * 24 * 60 * 60;
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

export function calculateBurnSummary(
  transactions: BurnTransaction[],
  chainId: number,
  contractAddress: `0x${string}`,
  originalSupplyRaw: bigint,
  currentTotalSupplyRaw: bigint,
  deploymentBlock: number,
  deploymentTimestamp: number,
  generatedAt: string,
  lastIndexedBlock: number,
): BurnSummary {
  const indexedBurnTotalRaw = transactions.reduce((total, transaction) => {
    return total + BigInt(transaction.amountBurnedRaw);
  }, 0n);
  const calculatedBurnTotalRaw = originalSupplyRaw - currentTotalSupplyRaw;
  const discrepancyRaw = calculatedBurnTotalRaw - indexedBurnTotalRaw;
  const latestBurn = transactions.at(-1) ?? null;

  return {
    chainId,
    contractAddress,
    originalSupplyRaw: originalSupplyRaw.toString(),
    originalSupplyFormatted: formatCompactTokenAmount(originalSupplyRaw),
    currentTotalSupplyRaw: currentTotalSupplyRaw.toString(),
    currentTotalSupplyFormatted: formatCompactTokenAmount(currentTotalSupplyRaw),
    indexedBurnTotalRaw: indexedBurnTotalRaw.toString(),
    indexedBurnTotalFormatted: formatCompactTokenAmount(indexedBurnTotalRaw),
    calculatedBurnTotalRaw: calculatedBurnTotalRaw.toString(),
    calculatedBurnTotalFormatted: formatCompactTokenAmount(calculatedBurnTotalRaw),
    percentSupplyBurned: formatPercentBurned(indexedBurnTotalRaw, originalSupplyRaw),
    burnTransactionCount: transactions.length,
    latestBurnTimestamp: latestBurn?.timestamp ?? null,
    latestBurnAmountFormatted: latestBurn?.amountBurnedFormatted ?? null,
    lastIndexedBlock,
    generatedAt,
    dataConsistent: discrepancyRaw === 0n,
    discrepancyRaw: discrepancyRaw.toString(),
    deploymentBlock,
    deploymentTimestamp,
  };
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
    cumulativeBurnedValue: Number(
      formatUnits(BigInt(transaction.cumulativeBurnedRaw), AJNA_CONFIG.tokenDecimals),
    ),
    remainingSupplyValue: Number(
      formatUnits(BigInt(transaction.remainingSupplyRaw), AJNA_CONFIG.tokenDecimals),
    ),
    amountBurnedValue: Number(formatUnits(BigInt(transaction.amountBurnedRaw), AJNA_CONFIG.tokenDecimals)),
  }));
}
