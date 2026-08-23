interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-medium tracking-widest text-stone-600 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      ) : null}
    </div>
  );
}
