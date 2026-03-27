'use client';

import { useState } from 'react';

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
        throw new Error(data?.error || 'Failed to create session.');
      }

      const target = data.redirect_to || `/?session_id=${encodeURIComponent(data.session_id)}`;
      window.location.href = target;
    } catch (error) {
      setErrorMessage(error?.message || 'Unexpected error while creating session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white p-6 md:p-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Session API Test</h1>
        <p className="mt-2 text-sm text-gray-300">
          Click the button to test POST /api/session using static merchant_id and random auth_token.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {isSubmitting ? 'Testing session flow...' : 'Run Session Test'}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
