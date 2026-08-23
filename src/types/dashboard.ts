import type { BurnChartPoint } from '../lib/burnView.js';
import type { BurnTimeRange } from './api.js';

export interface DashboardMetric {
  label: string;
  value: string;
  accessibilityLabel: string;
}

export interface BurnChartData {
  points: BurnChartPoint[];
  hasData: boolean;
  dateTickFormatter: (value: string | number) => string;
  valueTickFormatter: (value: number) => string;
}

export interface BurnHistoryRow {
  id: string;
  date: string;
  dateTime: string;
  dateTitle: string;
  amountBurned: string;
  amountBurnedTitle: string;
  cumulativeBurned: string;
  cumulativeBurnedTitle: string;
  remainingSupply: string;
  remainingSupplyTitle: string;
  transactionUrl: string;
  transactionLabel: string;
}

export interface SupplyConsistency {
  message: string;
  className: string;
}

export interface RangeOptionView {
  value: BurnTimeRange;
  label: string;
  isActive: boolean;
  className: string;
  onSelect: () => void;
}

export interface DashboardReadyState {
  status: 'ready';
  metrics: DashboardMetric[];
  dataUpdatedText: string;
  chart: BurnChartData;
  chartSummary: string;
  rangeOptions: RangeOptionView[];
  tableRows: BurnHistoryRow[];
  hasHistory: boolean;
  hasMoreRows: boolean;
  onLoadMore: () => void;
  consistency: SupplyConsistency;
}
