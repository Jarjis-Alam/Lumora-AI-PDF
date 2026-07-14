export function SkeletonCard() {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="skeleton h-12 w-10 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <div className="skeleton h-10 w-48 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <div className="space-y-2">
          <div className="skeleton h-4 w-72 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSummary() {
  return (
    <div className="space-y-4 p-6">
      <div className="skeleton h-6 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-3/4" />
      <div className="space-y-2 pt-4">
        <div className="skeleton h-5 w-1/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
      <div className="space-y-2 pt-4">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonFlashcards() {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="skeleton h-5 w-5 rounded-full" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
          <div className="border-t border-ink-100 pt-3 space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonQuiz() {
  return (
    <div className="space-y-6 p-6">
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="skeleton h-1 w-full rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton mb-4 h-5 w-2/3" />
          <div className="space-y-2">
            <div className="skeleton h-9 w-full rounded-lg" />
            <div className="skeleton h-9 w-full rounded-lg" />
            <div className="skeleton h-9 w-full rounded-lg" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGraph() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-3">
        <div className="skeleton h-12 w-32 rounded-full" />
        <div className="flex gap-3">
          <div className="skeleton h-10 w-24 rounded-full" />
          <div className="skeleton h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPdfPage() {
  return (
    <div className="space-y-5 py-4">
      {/* Title skeleton */}
      <div className="skeleton mx-auto h-6 w-3/5" />
      {/* Author / meta */}
      <div className="skeleton mx-auto h-3 w-2/5" />
      {/* Paragraph blocks */}
      <div className="space-y-3 pt-4">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-11/12" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-4/5" />
      </div>
      <div className="space-y-3 pt-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-3/4" />
      </div>
      <div className="space-y-3 pt-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-5/6" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function ProcessingOverlay({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {/* Skeleton-style processing indicator instead of spinner */}
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-crimson-400 animate-pulse-soft" style={{ animationDelay: '0ms' }} />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-crimson-400 animate-pulse-soft" style={{ animationDelay: '200ms' }} />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-crimson-400 animate-pulse-soft" style={{ animationDelay: '400ms' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ink-600">{label}</p>
        <p className="mt-1 text-2xs text-ink-400">This usually takes a few seconds</p>
      </div>
    </div>
  );
}
