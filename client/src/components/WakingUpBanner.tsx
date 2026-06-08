export default function WakingUpBanner() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 pt-0">
      <div className="flex flex-col items-center justify-center gap-5 py-20 bg-white rounded-3xl border border-amber-100 shadow-sm">
        {/* Animated paw dots */}
        <div className="flex gap-2 items-end h-10">
          {['🐾', '🐾', '🐾'].map((paw, i) => (
            <span
              key={i}
              className="text-2xl"
              style={{
                animation: 'wakeBounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                display: 'inline-block',
              }}
            >
              {paw}
            </span>
          ))}
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-lg font-bold text-gray-800">Fetching pets for you…</p>
          <p className="text-sm text-gray-500 max-w-xs">
            Our server is warming up 🐣 — your furry friends will appear in just a moment!
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-amber-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full origin-left"
            style={{ animation: 'wakeProgress 3s ease-in-out forwards' }}
          />
        </div>
      </div>

      {/* Keyframes injected inline — no CSS file needed */}
      <style>{`
        @keyframes wakeBounce {
          0%, 100% { transform: translateY(0);    opacity: 0.5; }
          50%       { transform: translateY(-8px); opacity: 1;   }
        }
        @keyframes wakeProgress {
          from { width: 0%;   }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
