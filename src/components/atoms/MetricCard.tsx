interface MetricCardProps {
  label: string;
  value: string;
  accessibilityLabel: string;
}

export function MetricCard({
  label,
  value,
  accessibilityLabel,
}: MetricCardProps) {
  return (
    <article className="min-h-28 rounded-2xl border border-stone-300/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-stone-600">{label}</p>
      <p
        className="mt-2 text-xl leading-tight font-bold tracking-tight text-stone-900 sm:text-2xl"
        aria-label={accessibilityLabel}
      >
        {value}
      </p>
    </article>
  );
}
