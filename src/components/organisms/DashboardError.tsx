import { Button } from '../atoms/Button.js';
import { Surface } from '../atoms/Surface.js';

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid w-full max-w-7xl content-start gap-4 px-2 py-2 sm:px-4 sm:py-6">
        <Surface className="grid gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-stone-600 uppercase">
              Ajna Burn Monitor
            </p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">
              Data load error
            </h1>
            <p className="mt-3 text-stone-600">{message}</p>
            <p className="mt-2 text-sm text-stone-600">
              Set VITE_BURNS_DATA_BASE_URL to the deployed API origin, then
              retry.
            </p>
          </div>
          <Button type="button" onClick={onRetry} className="w-fit">
            Retry
          </Button>
        </Surface>
      </div>
    </main>
  );
}
