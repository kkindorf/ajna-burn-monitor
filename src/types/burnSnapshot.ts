export interface BurnTransaction {
  transactionHash: string;
  timestamp: number;
  amountBurnedRaw: string;
  amountBurnedFormatted: string;
  cumulativeBurnedRaw: string;
  cumulativeBurnedFormatted: string;
  remainingSupplyRaw: string;
  remainingSupplyFormatted: string;
}

export interface BurnSummary {
  currentTotalSupplyRaw: string;
  currentTotalSupplyFormatted: string;
  indexedBurnTotalRaw: string;
  indexedBurnTotalFormatted: string;
  percentSupplyBurned: string;
  burnTransactionCount: number;
  generatedAt: string;
}
