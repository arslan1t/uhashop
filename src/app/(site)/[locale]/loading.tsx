// Generic loading state for all other routes (home, league, profile, etc.)
// Shows a minimal centered spinner so the page never looks blank
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* UHA logo mark shimmer */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse" />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, rgb(var(--accent)) 30%, transparent 60%)",
              animation: "spin 1s linear infinite",
            }}
          />
          <div className="absolute inset-[3px] rounded-xl bg-[rgb(var(--background))]" />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
