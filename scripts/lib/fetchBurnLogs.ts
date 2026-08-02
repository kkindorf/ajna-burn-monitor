import { AJNA_CONFIG, AJNA_ZERO_ADDRESS } from '../../src/lib/ajnaConfig.js';
import type { BurnLogRecord } from '../../src/types/burn.js';
import { collectDuneExecutionRows, executeDuneSql, waitForDuneExecutionCompletion } from './dune.js';

export interface DuneAjnaBurnTransferRow {
  amount_raw: string;
  block_number: string;
  block_time: string;
  evt_index: string;
  tx_hash: string;
}

export interface BurnHistorySnapshot {
  burnLogs: BurnLogRecord[];
  executionId: string;
  timestampsByBlock: Map<number, number>;
}

function parseUtcTimestampSeconds(value: string): number {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid Dune block_time value: ${value}`);
  }

  return Math.floor(parsed / 1000);
}

function normalizeTxHash(value: string): `0x${string}` {
  if (!value.startsWith('0x')) {
    throw new Error(`Unexpected Dune tx_hash value: ${value}`);
  }

  return value as `0x${string}`;
}

function normalizeBurnRows(rows: DuneAjnaBurnTransferRow[]): Omit<BurnHistorySnapshot, 'executionId'> {
  const deduped = new Map<string, BurnLogRecord>();
  const timestampsByBlock = new Map<number, number>();

  for (const row of rows) {
    const blockNumber = Number(row.block_number);
    const logIndex = Number(row.evt_index);
    const amountBurnedRaw = BigInt(row.amount_raw);
    const timestamp = parseUtcTimestampSeconds(row.block_time);
    const transactionHash = normalizeTxHash(row.tx_hash);
    const key = `${transactionHash}:${logIndex}`;

    if (!timestampsByBlock.has(blockNumber)) {
      timestampsByBlock.set(blockNumber, timestamp);
    }

    if (!deduped.has(key)) {
      deduped.set(key, {
        transactionHash,
        logIndex,
        blockNumber,
        amountBurnedRaw,
      });
      continue;
    }

    const existing = deduped.get(key);
    if (existing) {
      existing.amountBurnedRaw += amountBurnedRaw;
      existing.blockNumber = Math.min(existing.blockNumber, blockNumber);
      existing.logIndex = Math.min(existing.logIndex, logIndex);
    }
  }

  const burnLogs = [...deduped.values()].sort((left, right) => {
    if (left.blockNumber !== right.blockNumber) {
      return left.blockNumber - right.blockNumber;
    }
    if (left.logIndex !== right.logIndex) {
      return left.logIndex - right.logIndex;
    }
    return left.transactionHash.localeCompare(right.transactionHash);
  });

  return { burnLogs, timestampsByBlock };
}

export function buildAjnaBurnTransfersSql(): string {
  return `
SELECT
  block_time,
  CAST(block_number AS bigint) AS block_number,
  tx_hash,
  CAST(evt_index AS integer) AS evt_index,
  CAST(amount_raw AS varchar) AS amount_raw
FROM tokens.transfers
WHERE blockchain = 'ethereum'
  AND block_month >= DATE '2023-09-01'
  AND block_number >= ${AJNA_CONFIG.chartHistoryStartBlock}
  AND contract_address = ${AJNA_CONFIG.contractAddress}
  AND "to" = ${AJNA_ZERO_ADDRESS}
ORDER BY block_number ASC, evt_index ASC, tx_hash ASC
`.trim();
}

export async function fetchBurnLogs(): Promise<BurnHistorySnapshot> {
  const executionId = await executeDuneSql(buildAjnaBurnTransfersSql(), 'large');
  await waitForDuneExecutionCompletion(executionId);
  const rows = await collectDuneExecutionRows<DuneAjnaBurnTransferRow>(executionId, 1000);

  return {
    executionId,
    ...normalizeBurnRows(rows),
  };
}
