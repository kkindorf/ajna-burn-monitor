import type { PropsWithChildren } from 'react';

export function DashboardShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-2 py-2 sm:px-4 sm:py-6">
        {children}
      </div>
    </main>
  );
}
