import type { PropsWithChildren } from 'react';

interface SurfaceProps extends PropsWithChildren {
  className?: string;
}

export function Surface({ children, className = '' }: SurfaceProps) {
  return (
    <div
      className={`rounded-3xl border border-stone-300/70 bg-white/80 p-5 shadow-xl backdrop-blur sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
