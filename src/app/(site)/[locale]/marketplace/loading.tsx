// Shown instantly while MarketplaceClient.tsx hydrates — makes navigation feel instant
export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] pt-4 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">

        {/* Header skeleton */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="h-3 w-24 bg-white/6 rounded mb-2 animate-pulse" />
            <div className="h-7 w-40 bg-white/8 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* Quick-filter chips skeleton */}
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[80, 68, 60, 72, 56, 64, 52, 70, 58].map((w, i) => (
            <div
              key={i}
              className="h-8 bg-white/6 rounded-full shrink-0 animate-pulse"
              style={{ width: w, animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            <div className="h-10 bg-white/6 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-white/4 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
            <div className="h-px bg-white/5 my-4" />
            <div className="h-10 bg-white/6 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-white/4 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </aside>

          {/* Product grid skeleton */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ animationDelay: `${i * 30}ms` }}>
                {/* Image */}
                <div className="aspect-square bg-white/6 animate-pulse" />
                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/7 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-white/8 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
