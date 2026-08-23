import type { BurnSummary, BurnTransaction } from '../types/api.js';

export interface BurnSnapshot {
  summary: BurnSummary;
  burns: BurnTransaction[];
}

interface FetchBurnSnapshotOptions {
  forceRefresh?: boolean;
}

type JsonRecord = Record<string, unknown>;

const SNAPSHOT_CACHE_TTL_MS = 60_000;

let cachedSnapshot: {
  baseUrl: string;
  expiresAt: number;
  value: BurnSnapshot;
} | null = null;
const inFlightSnapshots = new Map<string, Promise<BurnSnapshot>>();

function getDataBaseUrl(): string {
  const configuredBase = import.meta.env.VITE_BURNS_DATA_BASE_URL?.trim();

  if (!configuredBase) {
    throw new Error('VITE_BURNS_DATA_BASE_URL is not set');
  }

  return configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
}

function readRecord(value: unknown, path: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
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

function readNullableInteger(
  record: JsonRecord,
  key: string,
  path: string,
): number | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new Error(`Expected ${path}.${key} to be an integer or null`);
  }

  return value;
}

function readNullableString(
  record: JsonRecord,
  key: string,
  path: string,
): string | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Expected ${path}.${key} to be a string or null`);
  }

  return value;
}

function readBoolean(record: JsonRecord, key: string, path: string): boolean {
  const value = record[key];

  if (typeof value !== 'boolean') {
    throw new Error(`Expected ${path}.${key} to be a boolean`);
  }

  return value;
}

function readHash(
  record: JsonRecord,
  key: string,
  path: string,
): `0x${string}` {
  const value = readString(record, key, path);

  if (!value.startsWith('0x')) {
    throw new Error(`Expected ${path}.${key} to be a hexadecimal hash`);
  }

  return value as `0x${string}`;
}

function readRawAmount(
  record: JsonRecord,
  key: string,
  path: string,
  allowNegative = false,
): string {
  const value = readString(record, key, path);
  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;

  if (!pattern.test(value)) {
    throw new Error(`Expected ${path}.${key} to be an integer string`);
  }

  return value;
}

function parseBurnTransaction(value: unknown, index: number): BurnTransaction {
  const path = `burns[${index}]`;
  const record = readRecord(value, path);

  return {
    transactionHash: readHash(record, 'transactionHash', path),
    blockNumber: readInteger(record, 'blockNumber', path),
    timestamp: readInteger(record, 'timestamp', path),
    date: readString(record, 'date', path),
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
    etherscanUrl: readString(record, 'etherscanUrl', path),
  };
}

function parseBurnSummary(value: unknown): BurnSummary {
  const path = 'summary';
  const record = readRecord(value, path);

  return {
    chainId: readInteger(record, 'chainId', path),
    contractAddress: readHash(record, 'contractAddress', path),
    originalSupplyRaw: readRawAmount(record, 'originalSupplyRaw', path),
    originalSupplyFormatted: readString(
      record,
      'originalSupplyFormatted',
      path,
    ),
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
    calculatedBurnTotalRaw: readRawAmount(
      record,
      'calculatedBurnTotalRaw',
      path,
    ),
    calculatedBurnTotalFormatted: readString(
      record,
      'calculatedBurnTotalFormatted',
      path,
    ),
    percentSupplyBurned: readString(record, 'percentSupplyBurned', path),
    burnTransactionCount: readInteger(record, 'burnTransactionCount', path),
    latestBurnTimestamp: readNullableInteger(
      record,
      'latestBurnTimestamp',
      path,
    ),
    latestBurnAmountFormatted: readNullableString(
      record,
      'latestBurnAmountFormatted',
      path,
    ),
    lastIndexedBlock: readInteger(record, 'lastIndexedBlock', path),
    generatedAt: readString(record, 'generatedAt', path),
    dataConsistent: readBoolean(record, 'dataConsistent', path),
    discrepancyRaw: readRawAmount(record, 'discrepancyRaw', path, true),
    deploymentBlock: readInteger(record, 'deploymentBlock', path),
    deploymentTimestamp: readInteger(record, 'deploymentTimestamp', path),
  };
}

function parseBurnTransactions(value: unknown): BurnTransaction[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected burns to be an array');
  }

  return value.map(parseBurnTransaction);
}

function assertSnapshotIntegrity(snapshot: BurnSnapshot): BurnSnapshot {
  if (snapshot.summary.burnTransactionCount !== snapshot.burns.length) {
    throw new Error(
      'Burn snapshot count does not match the transaction history',
    );
  }

  return snapshot;
}

async function fetchJson<T>(
  url: string,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }

  return parse(await response.json());
}

export function fetchBurnSnapshot({
  forceRefresh = false,
}: FetchBurnSnapshotOptions = {}): Promise<BurnSnapshot> {
  const baseUrl = getDataBaseUrl();
  const inFlight = inFlightSnapshots.get(baseUrl);

  if (inFlight) {
    return inFlight;
  }

  if (
    !forceRefresh &&
    cachedSnapshot?.baseUrl === baseUrl &&
    cachedSnapshot.expiresAt > Date.now()
  ) {
    return Promise.resolve(cachedSnapshot.value);
  }

  const request = Promise.all([
    fetchJson(`${baseUrl}data/summary.json`, parseBurnSummary),
    fetchJson(`${baseUrl}data/burns.json`, parseBurnTransactions),
  ])
    .then(([summary, burns]) => ({ summary, burns }))
    .then(assertSnapshotIntegrity);

  inFlightSnapshots.set(baseUrl, request);
  void request.then(
    (snapshot) => {
      cachedSnapshot = {
        baseUrl,
        expiresAt: Date.now() + SNAPSHOT_CACHE_TTL_MS,
        value: snapshot,
      };
      inFlightSnapshots.delete(baseUrl);
    },
    () => inFlightSnapshots.delete(baseUrl),
  );

  return request;
}
