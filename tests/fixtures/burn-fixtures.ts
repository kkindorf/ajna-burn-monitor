import type { BurnLogRecord, BurnTransaction } from '../../src/types/burn.js';

const AJNA = 10n ** 18n;

export const originalSupplyRaw = 10n * AJNA;

export const sampleLogs: BurnLogRecord[] = [
  {
    transactionHash: '0xaaa0000000000000000000000000000000000000000000000000000000000001',
    logIndex: 0,
    blockNumber: 100,
    amountBurnedRaw: 1n * AJNA,
  },
  {
    transactionHash: '0xaaa0000000000000000000000000000000000000000000000000000000000001',
    logIndex: 1,
    blockNumber: 100,
    amountBurnedRaw: 2n * AJNA,
  },
  {
    transactionHash: '0xbbb0000000000000000000000000000000000000000000000000000000000002',
    logIndex: 0,
    blockNumber: 130,
    amountBurnedRaw: 3n * AJNA,
  },
  {
    transactionHash: '0xbbb0000000000000000000000000000000000000000000000000000000000002',
    logIndex: 0,
    blockNumber: 130,
    amountBurnedRaw: 3n * AJNA,
  },
];

export const sampleTimestamps = new Map<number, number>([
  [100, 1_700_000_000 - 400 * 24 * 60 * 60],
  [130, 1_700_000_000 - 20 * 24 * 60 * 60],
]);

export function buildManyTransactions(count: number): BurnTransaction[] {
  const transactions: BurnTransaction[] = [];
  let cumulative = 0n;
  const generousSupply = 1_000n * AJNA;
  const presetOffsets = [400, 200, 60, 10];
  const offsets =
    count <= presetOffsets.length
      ? presetOffsets.slice(0, count)
      : Array.from({ length: count }, (_, index) => count - index);

  for (let index = 0; index < count; index += 1) {
    const amount = 1n * AJNA;
    cumulative += amount;
    const remaining = generousSupply - cumulative;
    const timestamp = 1_700_000_000 - offsets[index] * 24 * 60 * 60;
    transactions.push({
      transactionHash: `0x${(index + 1).toString(16).padStart(64, '0')}` as `0x${string}`,
      blockNumber: 10_000 + index,
      timestamp,
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      amountBurnedRaw: amount.toString(),
      amountBurnedFormatted: '1 AJNA',
      cumulativeBurnedRaw: cumulative.toString(),
      cumulativeBurnedFormatted: `${index + 1} AJNA`,
      remainingSupplyRaw: remaining.toString(),
      remainingSupplyFormatted: `${1_000 - (index + 1)} AJNA`,
      etherscanUrl: `https://etherscan.io/tx/${(index + 1).toString(16).padStart(64, '0')}`,
    });
  }

  return transactions;
}
