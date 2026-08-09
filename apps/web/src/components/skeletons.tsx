export function CardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-40 w-full mb-4" />
      <div className="skeleton h-4 w-2/3 mb-2" />
      <div className="skeleton h-3 w-1/2 mb-4" />
      <div className="flex items-center gap-2">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );
}
