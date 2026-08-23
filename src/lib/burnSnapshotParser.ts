import type { BurnSummary, BurnTransaction } from '../types/burnSnapshot.js';

type JsonRecord = Record<string, unknown>;

function readRecord(value: unknown, path: string): JsonRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected an object at ${path}`);
  }

  return value as JsonRecord;
}

function readString(record: JsonRecord, key: string, path: string): string {
  const value = record[key];

  if (typeof value !== 'string') {
    throw new Error(`Expected ${path}.${key} to be a string`);
  }

  return value;
}

function readInteger(record: JsonRecord, key: string, path: string): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new Error(`Expected ${path}.${key} to be an integer`);
  }

  return value;
}

function readRawAmount(record: JsonRecord, key: string, path: string): string {
  const value = readString(record, key, path);

  if (!/^\d+$/.test(value)) {
    throw new Error(`Expected ${path}.${key} to be an integer string`);
  }

  return value;
}

function parseBurnTransaction(value: unknown, index: number): BurnTransaction {
  const path = `burns[${index}]`;
  const record = readRecord(value, path);

  return {
    transactionHash: readString(record, 'transactionHash', path),
    timestamp: readInteger(record, 'timestamp', path),
    amountBurnedRaw: readRawAmount(record, 'amountBurnedRaw', path),
    amountBurnedFormatted: readString(record, 'amountBurnedFormatted', path),
    cumulativeBurnedRaw: readRawAmount(record, 'cumulativeBurnedRaw', path),
    cumulativeBurnedFormatted: readString(
      record,
      'cumulativeBurnedFormatted',
      path,
    ),
    remainingSupplyRaw: readRawAmount(record, 'remainingSupplyRaw', path),
    remainingSupplyFormatted: readString(
      record,
      'remainingSupplyFormatted',
      path,
    ),
  };
}

export function parseBurnSummary(value: unknown): BurnSummary {
  const path = 'summary';
  const record = readRecord(value, path);

  return {
    currentTotalSupplyRaw: readRawAmount(record, 'currentTotalSupplyRaw', path),
    currentTotalSupplyFormatted: readString(
      record,
      'currentTotalSupplyFormatted',
      path,
    ),
    indexedBurnTotalRaw: readRawAmount(record, 'indexedBurnTotalRaw', path),
    indexedBurnTotalFormatted: readString(
      record,
      'indexedBurnTotalFormatted',
      path,
    ),
    percentSupplyBurned: readString(record, 'percentSupplyBurned', path),
    burnTransactionCount: readInteger(record, 'burnTransactionCount', path),
    generatedAt: readString(record, 'generatedAt', path),
  };
}

export function parseBurnTransactions(value: unknown): BurnTransaction[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected burns to be an array');
  }

  return value.map(parseBurnTransaction);
}
