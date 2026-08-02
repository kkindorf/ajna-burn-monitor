interface MetricCardProps {
  label: string;
  value: string;
  exactValue: string;
}

export function MetricCard({ label, value, exactValue }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value" aria-label={`${label}: ${exactValue}`}>
        {value}
      </p>
    </article>
  );
}
