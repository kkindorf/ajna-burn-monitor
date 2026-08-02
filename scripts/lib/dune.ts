import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type DunePerformanceTier = 'small' | 'medium' | 'large';

function loadDotEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key] || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

function loadLocalEnvironment(): void {
  const cwd = process.cwd();
  loadDotEnvFile(join(cwd, '.env.local'));
  loadDotEnvFile(join(cwd, '.env'));
}

loadLocalEnvironment();

export interface DuneExecutionStatus {
  execution_id: string;
  query_id?: number;
  is_execution_finished: boolean;
  state: string;
  error?: {
    message: string;
    type?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface DuneExecutionResultPage<TRow> {
  execution_id: string;
  is_execution_finished: boolean;
  next_uri?: string | null;
  next_offset?: number;
  result?: {
    metadata?: Record<string, unknown>;
    rows?: TRow[];
  };
  state: string;
  error?: {
    message: string;
    type?: string;
    metadata?: Record<string, unknown>;
  };
}

interface ExecuteSqlResponse {
  execution_id: string;
  state: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getDuneApiKey(): string {
  const apiKey = process.env.DUNE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'DUNE_API_KEY is required to sync AJNA burn data from Dune. Generate a Dune API key, then set DUNE_API_KEY before running npm run sync:burns.',
    );
  }

  return apiKey;
}

function getDuneApiBaseUrl(): string {
  return process.env.DUNE_API_BASE_URL?.trim() || 'https://api.dune.com/api/v1';
}

function buildDuneUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  return `${getDuneApiBaseUrl()}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function isRetryableDuneError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|rate limit|temporary not available|temporary internal error|internal error|timeout|network error|fetch failed|econnreset|503|502|500/i.test(
    message,
  );
}

export async function withDuneRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number; label?: string } = {},
): Promise<T> {
  const retries = options.retries ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableDuneError(error) || attempt === retries) {
        throw error;
      }

      const delayMs = baseDelayMs * 2 ** attempt;
      const label = options.label ? ` (${options.label})` : '';
      console.warn(`Dune request failed${label}; retrying in ${delayMs}ms`, error);
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Dune request failed');
}

async function duneRequest<T>(pathOrUrl: string, init?: RequestInit): Promise<T> {
  const url = buildDuneUrl(pathOrUrl);
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-DUNE-API-KEY', getDuneApiKey());

  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Dune request failed (${response.status} ${response.statusText}) for ${url}: ${body}`);
  }

  return (await response.json()) as T;
}

export async function executeDuneSql(sql: string, performance: DunePerformanceTier = 'large'): Promise<string> {
  const response = await withDuneRetry(
    () =>
      duneRequest<ExecuteSqlResponse>('/sql/execute', {
        method: 'POST',
        body: JSON.stringify({
          sql,
          performance,
        }),
      }),
    { label: 'execute SQL' },
  );

  return response.execution_id;
}

export async function getDuneExecutionStatus(executionId: string): Promise<DuneExecutionStatus> {
  return withDuneRetry(
    () => duneRequest<DuneExecutionStatus>(`/execution/${executionId}/status`, { method: 'GET' }),
    {
      label: `execution status ${executionId}`,
    },
  );
}

export async function getDuneExecutionResultPage<TRow>(
  pathOrUrl: string,
): Promise<DuneExecutionResultPage<TRow>> {
  return withDuneRetry(
    () => duneRequest<DuneExecutionResultPage<TRow>>(pathOrUrl, { method: 'GET' }),
    {
      label: 'execution results',
    },
  );
}

export async function waitForDuneExecutionCompletion(executionId: string): Promise<DuneExecutionStatus> {
  const timeoutMs = 30 * 60 * 1000;
  const startedAt = Date.now();

  while (true) {
    const status = await getDuneExecutionStatus(executionId);

    if (status.state === 'QUERY_STATE_FAILED') {
      const message = status.error?.message ?? 'Dune execution failed';
      throw new Error(message);
    }

    if (status.state === 'QUERY_STATE_CANCELED') {
      throw new Error(`Dune execution ${executionId} was canceled`);
    }

    if (status.state === 'QUERY_STATE_EXPIRED') {
      throw new Error(`Dune execution ${executionId} expired before the results were retrieved`);
    }

    if (status.state === 'QUERY_STATE_COMPLETED_PARTIAL') {
      throw new Error(
        `Dune execution ${executionId} returned a partial result set. Narrow the SQL query or request partial results explicitly.`,
      );
    }

    if (status.is_execution_finished) {
      return status;
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Timed out waiting for Dune execution ${executionId} to finish`);
    }

    await sleep(1500);
  }
}

export async function collectDuneExecutionRows<TRow>(
  executionId: string,
  pageSize = 1000,
): Promise<TRow[]> {
  const rows: TRow[] = [];
  let nextUri: string | undefined = `/execution/${executionId}/results?limit=${pageSize}&offset=0`;

  while (nextUri) {
    const page: DuneExecutionResultPage<TRow> = await getDuneExecutionResultPage<TRow>(nextUri);

    if (page.error) {
      throw new Error(page.error.message ?? `Dune execution ${executionId} failed`);
    }

    if (page.result?.rows) {
      rows.push(...page.result.rows);
    }

    nextUri = page.next_uri ?? undefined;
  }

  return rows;
}
