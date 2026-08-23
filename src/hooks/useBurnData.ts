import { useEffect, useState } from 'react';
import { fetchBurnSnapshot } from '../lib/burnSnapshotClient.js';
import type { BurnSummary, BurnTransaction } from '../types/burnSnapshot.js';

type BurnDataState =
  | { status: 'loading' }
  | { status: 'ready'; summary: BurnSummary; burns: BurnTransaction[] }
  | { status: 'error'; message: string };

type BurnData = BurnDataState & { retry: () => void };

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown data load error';
}

export function useBurnData(): BurnData {
  const [state, setState] = useState<BurnDataState>({ status: 'loading' });
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBurnData() {
      try {
        const { summary, burns } = await fetchBurnSnapshot();

        if (!cancelled) {
          setState({ status: 'ready', summary, burns });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getErrorMessage(error) });
        }
      }
    }

    void loadBurnData();

    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  const retry = () => {
    setState({ status: 'loading' });
    setRefreshCount((count) => count + 1);
  };

  return { ...state, retry };
}
