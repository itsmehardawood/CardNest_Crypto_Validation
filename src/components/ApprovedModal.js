'use client';

export default function ApprovedModal({ points, onContinue }) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl border p-8 md:p-10 shadow-2xl animate-slideUp bg-linear-to-br from-emerald-900/85 via-emerald-950/80 to-teal-950/75 border-emerald-400/45 shadow-emerald-900/50">
        <div className="flex flex-col gap-5">
          <div>
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-emerald-300/20 blur-sm"></div>
              <div className="relative w-12 h-12 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-emerald-200/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 text-emerald-100 tracking-tight">Address Securely Validated</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80 mb-3">Security Status: Approved</p>
            <div className="w-full rounded-xl border border-emerald-300/20 bg-black/20 px-5 py-4">
              <ul className="space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-emerald-50/95">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0L3.29 9.21a1 1 0 011.415-1.42l4.042 4.043 6.542-6.543a1 1 0 011.415 0z"
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

        {/* <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-green-500 hover:bg-green-400 text-white"
          >
            Continue
          </button>
        </div> */}
      </div>
    </div>
  );
}
