'use client';

import { useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';

export default function SessionTestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAddressKey, setCopiedAddressKey] = useState('');
  // const MERCHANT_ID = '57G64J3535947754';
  const MERCHANT_ID = '7M94U03645102001';

  const WALLET_ADDRESSES = {
    good: '3P4PJRfFKfJQ4sqEQsHZKwVZmWRtjRFbeZ',
    bad: 'qpf2cphc5dkuclkqur7lhj2yuqq9pk3hmukle77vhq',
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (typeof data?.redirect_to === 'string' && data.redirect_to.length > 0) {
          window.location.href = data.redirect_to;
          return;
        }

        throw new Error(data?.error || data?.message || 'Unable to start demo right now.');
      }

      const target = data.redirect_to || `/?session_id=${encodeURIComponent(data.session_id)}`;
      window.location.href = target;
    } catch (error) {
      const fallback = 'Unable to start demo right now. Please try again.';
      setErrorMessage(error instanceof Error ? error.message || fallback : fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAddress = async (key, address) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedAddressKey(key);
      window.setTimeout(() => {
        setCopiedAddressKey((current) => (current === key ? '' : current));
      }, 1400);
    } catch {
      setCopiedAddressKey('');
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
              <h1 className="text-xl md:text-3xl font-bold text-red-200 tracking-tight">CardNest Crypto Simulation Guidelines</h1>
              <ul className="space-y-2 text-left text-sm md:text-base leading-relaxed text-red-100/90 list-disc pl-5">
                <li>This is a <strong>User Acceptance Testing session (UAT)</strong>.</li>
                <li>
                  All testing conducted here is <strong>securely monitored and encrypted</strong>, as this is our baseline as a{' '}
                  <strong>security-conscious business</strong>.
                </li>
                <li>
                  Use the following <strong>crypto wallet addresses to perform the simulation</strong>. These addresses help users understand
                  how CardNest Crypto security validation works.
                </li>
              </ul>

              <div className="rounded-2xl border border-red-400/40 bg-black/45 p-4 md:p-5 text-left space-y-4">
                <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-red-200/90">Wallet Addresses</p>

                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-400/45 bg-emerald-500/10 p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-emerald-200">Good Address</p>
                        <p className="mt-1 break-all text-xs md:text-sm text-emerald-100">{WALLET_ADDRESSES.good}</p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyAddress('good', WALLET_ADDRESSES.good)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-300/50 bg-emerald-500/20 text-emerald-100 transition hover:bg-emerald-500/30"
                          aria-label="Copy good wallet address"
                        >
                          {copiedAddressKey === 'good' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                        </button>
                        {copiedAddressKey === 'good' ? (
                          <span className="absolute -top-8 right-0 rounded-md border border-emerald-300/50 bg-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-100">
                            Copied
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-red-200">Bad Address</p>
                        <p className="mt-1 break-all text-xs md:text-sm text-red-100">{WALLET_ADDRESSES.bad}</p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyAddress('bad', WALLET_ADDRESSES.bad)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-300/60 bg-red-500/20 text-red-100 transition hover:bg-red-500/30"
                          aria-label="Copy bad wallet address"
                        >
                          {copiedAddressKey === 'bad' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                        </button>
                        {copiedAddressKey === 'bad' ? (
                          <span className="absolute -top-8 right-0 rounded-md border border-red-300/60 bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-100">
                            Copied
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-left text-sm md:text-base leading-relaxed text-red-100/90 list-disc pl-5">
                <li>
                  We securely validate against numerous <strong>crypto security codes and baselines</strong> to ensure:
                </li>
                <li>Address pattern validation</li>
                <li>Sanction list validation</li>
                <li>Blockchain ownership verification</li>
                <li>Sender and recipient security confidence before any transaction</li>
                <li>
                  If you encounter any issues during this <strong>UAT simulation</strong>, contact:{' '}
                  <a href="mailto:support@cardnest.io" className="font-semibold text-red-200 underline decoration-red-300/60 underline-offset-2 hover:text-red-100">
                    support@cardnest.io
                  </a>
                </li>
              </ul>

              <p className="text-xs md:text-sm text-gray-300/90">Press the button below to start a quick test.</p>

              <form onSubmit={handleSubmit} className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-red-300/40 bg-red-500/85 px-4 py-3 text-sm md:text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Starting simulation...' : 'Start Simulation'}
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
