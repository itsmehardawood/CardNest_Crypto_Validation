'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SessionTestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const MERCHANT_ID = '32323u2739';

  const generateAuthToken = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `token_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    const authToken = generateAuthToken();

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
          auth_token: authToken,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error('Unable to start demo right now.');
      }

      const target = data.redirect_to || `/?session_id=${encodeURIComponent(data.session_id)}`;
      window.location.href = target;
    } catch {
      setErrorMessage('Unable to start demo right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col p-4 md:p-8 animate-fadeIn">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>

      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl bg-linear-to-br from-red-950/55 via-black/55 to-red-900/45 backdrop-blur-xl border border-red-500/40 bg-black/45 p-8 md:p-10 shadow-2xl">
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg shadow-red-600/40">
                <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-red-200 tracking-tight">Try The Live Demo</h1>
              <p className="text-sm md:text-base leading-relaxed text-red-100/90">
                Experience how CardNest validates a recipient crypto wallet before a transaction.
              </p>
              <p className="text-xs md:text-sm text-gray-300/90">
                Press the button below to start a quick test.
              </p>

              <form onSubmit={handleSubmit} className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-red-300/40 bg-red-500/85 px-4 py-3 text-sm md:text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Starting demo...' : 'Start Demo'}
                </button>
              </form>

              {errorMessage ? (
                <div className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 w-full pt-6 pb-2 text-center">
        <p className="text-gray-500 text-xs md:text-sm">
          © 2026 CardNest. All rights reserved.
        </p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
