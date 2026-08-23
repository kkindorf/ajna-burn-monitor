import { Surface } from '../atoms/Surface.js';

export function DashboardLoading() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid w-full max-w-7xl content-start gap-4 px-2 py-2 sm:px-4 sm:py-6">
        <Surface>
          <p className="text-xs font-medium tracking-widest text-stone-600 uppercase">
            Ajna Burn Monitor
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">
            Ajna Burn Monitor
          </h1>
          <p className="mt-3 text-stone-600">
            Loading dashboard data from the configured API origin...
          </p>
        </Surface>
      </div>
    </main>
  );
}
