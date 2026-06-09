// Shown instantly while ProductDetailClient hydrates
export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] pt-6 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8">
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-3 bg-white/4 rounded animate-pulse" />
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl bg-white/7 animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Brand + badge */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-14 bg-white/5 rounded animate-pulse" />
              <div className="h-5 w-16 bg-white/8 rounded-full animate-pulse" />
            </div>
            {/* Name */}
            <div className="space-y-2">
              <div className="h-8 w-full bg-white/8 rounded-lg animate-pulse" />
              <div className="h-8 w-4/5 bg-white/6 rounded-lg animate-pulse" />
            </div>
            {/* Price */}
            <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />
            {/* Version toggle */}
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            {/* Sizes */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 30}ms` }} />
                ))}
              </div>
            </div>
            {/* CTA buttons */}
            <div className="space-y-3 pt-2">
              <div className="h-14 bg-white/10 rounded-2xl animate-pulse" />
              <div className="h-14 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
