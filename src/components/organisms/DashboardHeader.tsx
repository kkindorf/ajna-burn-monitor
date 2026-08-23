import { formatUtcDateTime } from '../../lib/display.js';
import { Surface } from '../atoms/Surface.js';

interface DashboardHeaderProps {
  generatedAt: string;
}

export function DashboardHeader({ generatedAt }: DashboardHeaderProps) {
  const timestamp = Math.floor(new Date(generatedAt).getTime() / 1000);
  const updatedText = Number.isNaN(timestamp)
    ? 'Not yet synced'
    : `Updated ${formatUtcDateTime(timestamp)} UTC`;

  return (
    <Surface className="flex flex-wrap items-start justify-between gap-4">
      <header>
        <p className="text-xs font-medium tracking-widest text-stone-600 uppercase">
          Ajna Burn Monitor
        </p>
        <h1 className="mt-1 text-4xl leading-none font-bold tracking-tight text-stone-900 sm:text-5xl">
          Ajna Burn Monitor
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          A transparent record of AJNA permanently removed from supply.
        </p>
      </header>
      <p
        className="self-center rounded-full border border-emerald-800/20 bg-emerald-800/10 px-3 py-2 text-sm text-emerald-800"
        aria-live="polite"
      >
        {updatedText}
      </p>
    </Surface>
  );
}
