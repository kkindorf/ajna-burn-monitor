import { Surface } from '../atoms/Surface.js';
import { DashboardShell } from './DashboardShell.js';

export function DashboardLoading() {
  return (
    <DashboardShell>
      <Surface>
        <p className="text-xs font-medium tracking-widest text-stone-600 uppercase">
          Ajna Burn Monitor
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight">
          Ajna Burn Monitor
        </h1>
        <p className="mt-3 text-stone-600">
          Loading the latest burn snapshot...
        </p>
      </Surface>
    </DashboardShell>
  );
}
