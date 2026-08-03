import { useEffect, useState } from 'react';
import type { BurnSummary, BurnTimeRange, BurnTransaction } from './types/api.js';
import {
  downsampleBurnTransactions,
  filterBurnTransactionsByRange,
  formatBurnChartSummary,
  reverseBurnTransactions,
} from './lib/burnView.js';
import { formatUtcDateTime } from './lib/display.js';
import { BurnChart } from './components/BurnChart.js';
import { BurnTable } from './components/BurnTable.js';
import { Methodology } from './components/Methodology.js';
import { MetricCard } from './components/MetricCard.js';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; summary: BurnSummary; burns: BurnTransaction[] }
  | { status: 'empty'; summary: BurnSummary | null; burns: BurnTransaction[] }
  | { status: 'error'; message: string };

const DEFAULT_VISIBLE_ROWS = 25;

function getDataBaseUrl(): string {
  const configuredBase = import.meta.env.VITE_BURNS_DATA_BASE_URL?.trim();

  if (!configuredBase) {
    throw new Error('VITE_BURNS_DATA_BASE_URL is not set');
  }

  return configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
}

function buildDataUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${getDataBaseUrl()}${normalizedPath}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [timeRange, setTimeRange] = useState<BurnTimeRange>('all');
  const [visibleRows, setVisibleRows] = useState(DEFAULT_VISIBLE_ROWS);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [summary, burns] = await Promise.all([
          fetchJson<BurnSummary>(buildDataUrl('data/summary.json')),
          fetchJson<BurnTransaction[]>(buildDataUrl('data/burns.json')),
        ]);

        if (!active) {
          return;
        }

        if (burns.length === 0) {
          setLoadState({ status: 'empty', summary, burns });
          return;
        }

        setLoadState({ status: 'ready', summary, burns });
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown data load error',
        });
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const retry = () => {
    setLoadState({ status: 'loading' });
    setVisibleRows(DEFAULT_VISIBLE_ROWS);
    setTimeRange('all');
    window.location.reload();
  };

  if (loadState.status === 'loading') {
    return (
      <main className="app-shell">
        <section className="hero panel">
          <p className="eyebrow">Ajna Burn Monitor</p>
          <h1>Ajna Burn Monitor</h1>
          <p className="lede">Loading burn data from the API snapshot.</p>
        </section>
        <section className="panel">
          <p>Loading dashboard data from the configured API origin...</p>
        </section>
      </main>
    );
  }

  if (loadState.status === 'error') {
    return (
      <main className="app-shell">
        <section className="hero panel">
          <p className="eyebrow">Ajna Burn Monitor</p>
          <h1>Ajna Burn Monitor</h1>
          <p className="lede">A transparent record of AJNA permanently removed from supply.</p>
        </section>
        <section className="panel state-panel">
          <h2>Data load error</h2>
          <p>{loadState.message}</p>
          <p className="muted-copy">Set `VITE_BURNS_DATA_BASE_URL` to the deployed API origin, then reload.</p>
          <button type="button" className="button" onClick={retry}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  const summary = loadState.summary;
  const burns = loadState.burns;
  const latestTimestamp =
    summary?.latestBurnTimestamp ?? burns.at(-1)?.timestamp ?? Math.floor(Date.now() / 1000);
  const filteredBurns = filterBurnTransactionsByRange(burns, timeRange, latestTimestamp);
  const chartBurns = downsampleBurnTransactions(filteredBurns);
  const burnsNewestFirst = reverseBurnTransactions(burns).slice(0, visibleRows);
  const hasMoreRows = visibleRows < burns.length;
  const chartSummary = formatBurnChartSummary(filteredBurns);
  const dataUpdatedText =
    summary && summary.generatedAt
      ? `Updated ${formatUtcDateTime(Math.floor(new Date(summary.generatedAt).getTime() / 1000))} UTC`
      : 'Not yet synced';

  const latestBurn =
    summary?.latestBurnTimestamp && summary.latestBurnAmountFormatted
      ? `${summary.latestBurnAmountFormatted} on ${new Date(summary.latestBurnTimestamp * 1000).toLocaleDateString('en-US', {
          timeZone: 'UTC',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : 'No burn transactions yet';

  const totalSupplyValue = summary?.currentTotalSupplyFormatted ?? '0 AJNA';
  const totalBurnedValue = summary?.indexedBurnTotalFormatted ?? '0 AJNA';
  const percentBurnedValue = summary?.percentSupplyBurned ?? '0.000%';
  const burnCountValue = summary?.burnTransactionCount ?? burns.length;

  return (
    <main className="app-shell">
      <header className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Ajna Burn Monitor</p>
          <h1>Ajna Burn Monitor</h1>
          <p className="lede">A transparent record of AJNA permanently removed from supply.</p>
        </div>
        <div className="status-pill" aria-live="polite">
          {dataUpdatedText}
        </div>
      </header>

      <section className="metrics-grid" aria-label="AJNA burn metrics">
        <MetricCard label="Current supply" value={totalSupplyValue} exactValue={summary?.currentTotalSupplyRaw ?? '0'} />
        <MetricCard label="AJNA burned" value={totalBurnedValue} exactValue={summary?.indexedBurnTotalRaw ?? '0'} />
        <MetricCard label="% of launch supply burned" value={percentBurnedValue} exactValue={summary?.percentSupplyBurned ?? '0.000%'} />
        <MetricCard label="Burn transactions" value={burnCountValue.toString()} exactValue={burnCountValue.toString()} />
        <MetricCard label="Most recent burn" value={latestBurn} exactValue={latestBurn} />
      </section>

      <BurnChart
        burns={chartBurns}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        summaryText={chartSummary}
      />

      <BurnTable
        burns={burnsNewestFirst}
        hasMore={hasMoreRows}
        onLoadMore={() => setVisibleRows((current) => current + DEFAULT_VISIBLE_ROWS)}
      />

      <Methodology
        dataConsistent={summary?.dataConsistent ?? true}
        discrepancyRaw={summary?.discrepancyRaw ?? '0'}
      />
    </main>
  );
}
