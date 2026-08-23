import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchBurnSnapshot } from '../lib/api.js';
import type { BurnSummary, BurnTransaction } from '../types/api.js';

type BurnDataState =
  | { status: 'loading' }
  | { status: 'ready'; summary: BurnSummary; burns: BurnTransaction[] }
  | { status: 'error'; message: string };

export function useBurnData() {
  const [state, setState] = useState<BurnDataState>({ status: 'loading' });
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { summary, burns } = await fetchBurnSnapshot({
          forceRefresh: requestVersion > 0,
        });

        if (!active) {
          return;
        }

        setState({ status: 'ready', summary, burns });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Unknown data load error',
        });
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [requestVersion]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setRequestVersion((version) => version + 1);
  }, []);
  return useMemo(() => ({ ...state, retry }), [state, retry]);
}
