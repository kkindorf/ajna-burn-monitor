import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveOriginalSupply } from './lib/resolveOriginalSupply.js';
import { fetchBurnLogs } from './lib/fetchBurnLogs.js';
import { AJNA_CONFIG } from '../src/lib/ajnaConfig.js';
import {
  buildBurnTransactions,
  calculateBurnSummary,
  calculateRemainingSupplyRaw,
  groupBurnLogsByTransaction,
  sortBurnTransactionsChronologically,
} from '../src/lib/burns.js';

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const generatedAt = new Date().toISOString();
  const originalSupply = resolveOriginalSupply();

  console.log('AJNA burn sync starting');
  console.log('Source: Dune SQL');
  console.log(`Deployment block: ${originalSupply.deploymentBlock} (${new Date(originalSupply.deploymentTimestamp * 1000).toISOString()})`);
  console.log(`Launch supply baseline: ${originalSupply.originalSupplyRaw.toString()} raw`);

  const burnHistory = await fetchBurnLogs();
  console.log(`Dune execution id: ${burnHistory.executionId}`);
  console.log(`Fetched ${burnHistory.burnLogs.length} burn log rows`);

  const groupedBurns = groupBurnLogsByTransaction(burnHistory.burnLogs);
  const burnTransactionsAscending = sortBurnTransactionsChronologically(
    buildBurnTransactions(groupedBurns, burnHistory.timestampsByBlock, originalSupply.originalSupplyRaw),
  );

  const indexedBurnTotalRaw = burnTransactionsAscending.reduce((total, transaction) => {
    return total + BigInt(transaction.amountBurnedRaw);
  }, 0n);
  const currentTotalSupplyRaw = calculateRemainingSupplyRaw(originalSupply.originalSupplyRaw, indexedBurnTotalRaw);

  const summary = calculateBurnSummary(
    burnTransactionsAscending,
    AJNA_CONFIG.chainId,
    AJNA_CONFIG.contractAddress,
    originalSupply.originalSupplyRaw,
    currentTotalSupplyRaw,
    originalSupply.deploymentBlock,
    originalSupply.deploymentTimestamp,
    generatedAt,
    burnTransactionsAscending.at(-1)?.blockNumber ?? originalSupply.deploymentBlock,
  );

  const dataDir = join(process.cwd(), 'public', 'data');
  await mkdir(dataDir, { recursive: true });

  await writeJson(join(dataDir, 'burns.json'), burnTransactionsAscending);
  await writeJson(join(dataDir, 'summary.json'), summary);

  console.log(`Burn transactions: ${burnTransactionsAscending.length}`);
  console.log(`Current total supply: ${summary.currentTotalSupplyFormatted}`);
  console.log(`Indexed burn total: ${summary.indexedBurnTotalFormatted}`);
  console.log(`Supply-reduction burn total: ${summary.calculatedBurnTotalFormatted}`);

  if (!summary.dataConsistent) {
    console.warn(`Data mismatch detected: discrepancy raw ${summary.discrepancyRaw}`);
  }

  console.log('AJNA burn sync complete');
}

main().catch((error) => {
  console.error('AJNA burn sync failed');
  console.error(error);
  process.exitCode = 1;
});
