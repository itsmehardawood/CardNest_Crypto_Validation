'use client';

export default function InvalidModal({ message, points = [], onRetry }) {
  const displayPoints = Array.isArray(points) && points.length > 0 ? points : [message];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl border p-8 md:p-10 shadow-2xl animate-slideUp bg-linear-to-br from-rose-950/90 to-red-900/70 border-red-500/50">
        <div className="flex flex-col gap-5">
          <div>
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-red-300/20 blur-sm"></div>
              <div className="relative w-12 h-12 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center ring-2 ring-red-200/35">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 text-red-100 tracking-tight">Address Not Valid</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-red-300/80 mb-3">Security Status: Rejected</p>
            <div className="w-full rounded-xl border border-red-300/25 bg-black/25 px-5 py-4">
              <ul className="space-y-3">
                {displayPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-red-50/95">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="text-sm md:text-base leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-red-500 hover:bg-red-400 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
