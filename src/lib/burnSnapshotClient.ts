import type { BurnSummary, BurnTransaction } from '../types/burnSnapshot.js';
import {
  parseBurnSummary,
  parseBurnTransactions,
} from './burnSnapshotParser.js';

interface BurnSnapshot {
  summary: BurnSummary;
  burns: BurnTransaction[];
}

let snapshotRequest: Promise<BurnSnapshot> | null = null;

async function loadBurnSnapshot(): Promise<BurnSnapshot> {
  const configuredBase = import.meta.env.VITE_BURNS_DATA_BASE_URL?.trim();

  if (!configuredBase) {
    throw new Error('VITE_BURNS_DATA_BASE_URL is not set');
  }

  const baseUrl = configuredBase.endsWith('/')
    ? configuredBase
    : `${configuredBase}/`;
  const [summary, burns] = await Promise.all([
    fetchJson(`${baseUrl}data/summary.json`, parseBurnSummary),
    fetchJson(`${baseUrl}data/burns.json`, parseBurnTransactions),
  ]);

  if (summary.burnTransactionCount !== burns.length) {
    throw new Error(
      'Burn snapshot count does not match the transaction history',
    );
  }

  return { summary, burns };
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

export function fetchBurnSnapshot(): Promise<BurnSnapshot> {
  if (!snapshotRequest) {
    snapshotRequest = loadBurnSnapshot().finally(() => {
      snapshotRequest = null;
    });
  }

  return snapshotRequest;
}
