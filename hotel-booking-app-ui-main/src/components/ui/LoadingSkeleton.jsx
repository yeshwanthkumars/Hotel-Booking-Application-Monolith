export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, idx) => (
          <SkeletonBlock key={idx} className="h-5" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((__, innerIdx) => (
              <SkeletonBlock key={innerIdx} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="mt-4 h-5 w-2/3" />
          <SkeletonBlock className="mt-3 h-4" />
          <SkeletonBlock className="mt-2 h-4 w-4/5" />
          <SkeletonBlock className="mt-5 h-9" />
        </div>
      ))}
    </div>
  );
}
