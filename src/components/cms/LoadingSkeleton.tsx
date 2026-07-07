'use client';

export function CMSPageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white p-4 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-7 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}