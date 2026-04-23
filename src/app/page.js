'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import ApprovedModal from '@/components/ApprovedModal';
import InvalidModal from '@/components/InvalidModal';

export default function CryptoValidatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading secure session...
        </div>
      }
    >
      <CryptoValidatePageContent />
    </Suspense>
  );
}

function CryptoValidatePageContent() {
  const successValidationPoints = [
    "The recipient's crypto address you entered passed our security format validation.",
    'This crypto address was securely validated successfully against millions of sanctioned data.',
  ];

  const searchParams = useSearchParams();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const accessCheckStarted = useRef(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [memoTag, setMemoTag] = useState('');
  const [isMemoRequired, setIsMemoRequired] = useState(false);
  const [memoChain, setMemoChain] = useState('');
  const [isCheckingMemo, setIsCheckingMemo] = useState(false);
  const [memoCheckError, setMemoCheckError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState('');
  const [validationStatus, setValidationStatus] = useState(null); 
  const [validationMessage, setValidationMessage] = useState('');
  const [approvedPoints, setApprovedPoints] = useState(successValidationPoints);
  const [invalidPoints, setInvalidPoints] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [encryptedData, setEncryptedData] = useState('');

  useEffect(() => {
    if (accessCheckStarted.current) {
      return;
    }

    accessCheckStarted.current = true;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setHasAccess(false);
      setAccessChecked(true);
      return;
    }

    const verifyAccess = async () => {
      try {
        const response = await fetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const data = await response.json().catch(() => null);
        const resolvedMerchantId = typeof data?.merchant_id === 'string' ? data.merchant_id.trim() : '';
        const isAllowed = response.ok && data?.success === true && resolvedMerchantId.length > 0;

        if (isAllowed) {
          setMerchantId(resolvedMerchantId);
        }

        setHasAccess(isAllowed);
      } catch {
        setMerchantId('');
        setHasAccess(false);
      } finally {
        setAccessChecked(true);
      }
    };

    verifyAccess();
  }, [searchParams]);

  useEffect(() => {
    const hasAddress = walletAddress.trim().length > 0;
    const hasMemo = memoTag.trim().length > 0;

    if (!hasAddress || isCheckingMemo) {
      setShowButton(false);
      return;
    }

    setShowButton(isMemoRequired ? hasMemo : true);
  }, [walletAddress, memoTag, isMemoRequired, isCheckingMemo]);

  // Trigger final API call after modal is displayed
  useEffect(() => {
    if (!validationStatus || !merchantId || !encryptedData) {
      return;
    }

    // Set timeout for 2-3 seconds before calling final API
    const timeoutId = setTimeout(async () => {
      try {
        const encryptedDataResponse = await fetch('https://cryptolaravel.cardnest.io/api/crypto/encrypted-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchant_id: merchantId,
            encrypted_data: encryptedData,
          }),
        });

        const payload = await encryptedDataResponse.json().catch(() => null);

        if (!encryptedDataResponse.ok || !payload) {
          return;
        }

        const responseJson = JSON.stringify({
          status: true,
          encrypted_data: payload.encrypted_data,
        });

        if (
          typeof window !== 'undefined' &&
          window.Android &&
          typeof window.Android.handleApiResponse === 'function'
        ) {
          window.Android.handleApiResponse(responseJson);
        }

        if (typeof window !== 'undefined') {
          // Direct parent function callback only works for same-origin embeds.
          try {
            if (
              window.parent &&
              typeof window.parent.handleApiResponse === 'function'
            ) {
              window.parent.handleApiResponse(responseJson);
            }
          } catch {
            // Ignore cross-origin parent access issues
          }

          // Always attempt cross-origin-safe transport for iframe integrations.
          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(
                {
                  source: 'cardnest-crypto-validation',
                  type: 'handleApiResponse',
                  status: true,
                  encrypted_data: payload.encrypted_data,
                  data: responseJson,
                },
                '*'
              );
            }
          } catch {
            // Ignore cross-origin messaging issues
          }
        }

        // Fire and forget - no UI updates
      } catch {
        // Silently fail - do not update UI
      }
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timeoutId);
  }, [validationStatus, merchantId, encryptedData]);

  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="relative min-h-screen  bg-black flex items-center justify-center p-4 md:p-8 animate-fadeIn">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>

        <div className="relative z-10 w-full max-w-xl  rounded-3xl bg-linear-to-br from-red-950/55 via-black/55 to-red-900/45 backdrop-blur-xl  border border-red-500/40 bg-black/45  p-8 md:p-10 shadow-2xl">
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg shadow-red-600/40">
                <ShieldAlert className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-red-200 tracking-tight">Access Denied</h1>
              <p className="text-sm md:text-base leading-relaxed text-red-100/90">
                We couldn&apos;t verify this secure link right now.
              </p>
              <p className="text-xs md:text-sm text-gray-300/90">
                Please request a new link from the merchant and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const runMemoCheck = async (address) => {
    if (!merchantId) {
      setMemoCheckError('Session merchant identity is missing. Please request a new link.');
      return;
    }

    const cleanedAddress = address.trim();

    if (!cleanedAddress) {
      setWalletAddress('');
      setMemoTag('');
      setIsMemoRequired(false);
      setMemoChain('');
      setMemoCheckError('');
      setIsCheckingMemo(false);
      return;
    }

    setWalletAddress(cleanedAddress);
    setMemoTag('');
    setIsMemoRequired(false);
    setMemoChain('');
    setMemoCheckError('');
    setIsCheckingMemo(true);
    const startedAt = Date.now();

    try {
      const response = await fetch('https://cryptolaravel.cardnest.io/api/crypto/memo-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: merchantId,
          address: cleanedAddress,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        throw new Error(data?.message || data?.error || 'Unable to check memo requirement.');
      }

      setMemoChain(data?.chain ? String(data.chain) : '');

      if (data?.is_memo_required === true) {
        setIsMemoRequired(true);
      }
    } catch (error) {
      setIsMemoRequired(false);
      setMemoChain('');
      setMemoCheckError('Memo check unavailable. You can continue validation without memo.');
    } finally {
      const minLoaderMs = 3500;
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs < minLoaderMs) {
        await new Promise((resolve) => setTimeout(resolve, minLoaderMs - elapsedMs));
      }
      setIsCheckingMemo(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      await runMemoCheck(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleInputPaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    runMemoCheck(pastedText);
  };

  const handleMemoPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMemoTag(text.trim());
    } catch (err) {
      console.error('Failed to read clipboard for memo/tag:', err);
    }
  };

  const handleMemoInputPaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    setMemoTag(pastedText.trim());
  };

  const handleValidation = async () => {
    const address = walletAddress.trim();
    if (!address) return;
    if (!merchantId) {
      setValidationStatus('error');
      setValidationMessage('Session merchant identity is missing. Please request a new link.');
      setInvalidPoints(['Session merchant identity is missing. Please request a new link.']);
      return;
    }

    const memoValue = isMemoRequired ? memoTag.trim() : null;
    if (isMemoRequired && !memoValue) return;

    setIsValidating(true);
    setValidationStatus(null);
    setValidationMessage('');
    setApprovedPoints(successValidationPoints);
    setInvalidPoints([]);

    const minValidationLoaderMs = 7000;
    const secondStepDelayMs = 3000;
    const thirdStepDelayMs = 5000;
    const validationStartedAt = Date.now();

    setValidationStep('Running security checks...');
    const secondValidationStepTimer = setTimeout(() => {
      setValidationStep(
        "The recipient's crypto address you entered passed our security format validation..."
      );
    }, secondStepDelayMs);

    const thirdValidationStepTimer = setTimeout(() => {
      setValidationStep('This crypto address is validating against millions of sanctioned data..');
    }, thirdStepDelayMs);

    let nextStatus = 'error';
    let nextMessage = 'Unable to validate wallet address right now. Please try again.';

    try {
      const response = await fetch('https://cryptolaravel.cardnest.io/api/crypto/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: merchantId,
          address,
          chain: null,
          memo: memoValue,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        const errorMessage =
          data?.message ||
          data?.error ||
          'Unable to validate wallet address right now. Please try again.';
        throw new Error(errorMessage);
      }

      // Store encrypted_data from validate API response
      const responseData = data?.data ? String(data.data) : '';
      setEncryptedData(responseData);

      const normalizedStatus =
        typeof data?.status === 'string' ? data.status.toLowerCase() : null;
      const isSanctioned = data?.is_sanctioned === true;
      const isApproved =
        data?.is_valid === true &&
        !isSanctioned &&
        (normalizedStatus ? normalizedStatus === 'success' : true);

      if (isApproved) {
        const chainFromValidation = data?.chain ? String(data.chain).trim() : '';
        const nextApprovedPoints = [...successValidationPoints];

        if (chainFromValidation) {
          nextApprovedPoints.unshift(
            `The recipient's crypto address you entered belongs to ${chainFromValidation} Blockchain`
          );
        }

        nextStatus = 'success';
        nextMessage = successValidationPoints.join(' ');
        setApprovedPoints(nextApprovedPoints);
      } else {
        nextStatus = 'error';
        nextMessage =
          data?.is_valid === false
            ? "This address isn't valid. Please check and try again."
            : isSanctioned
              ? 'This address is on sanction lists and is not approved for transaction.'
              : data?.message || data?.error || 'This address is not approved for transaction.';

        setInvalidPoints([nextMessage]);
      }
    } catch (error) {
      nextStatus = 'error';
      nextMessage =
        error?.message || 'Unable to validate wallet address right now. Please try again.';
      setInvalidPoints([nextMessage]);
    } finally {
      const elapsedMs = Date.now() - validationStartedAt;
      const remainingLoaderMs = Math.max(0, minValidationLoaderMs - elapsedMs);
      if (remainingLoaderMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingLoaderMs));
      }

      clearTimeout(secondValidationStepTimer);
      clearTimeout(thirdValidationStepTimer);

      setIsValidating(false);
      setValidationStep('');
      setValidationStatus(nextStatus);
      setValidationMessage(nextMessage);
    }
  };

  const handleRetry = () => {
    setValidationStatus(null);
    setValidationMessage('');
    setWalletAddress('');
    setMemoTag('');
    setIsMemoRequired(false);
    setMemoChain('');
    setMemoCheckError('');
    setIsCheckingMemo(false);
    setInvalidPoints([]);
    setEncryptedData('');
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col p-4 md:p-8 animate-fadeIn">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-2xl">
        
        {/* Glassmorphism Card */}
        <div className="bg-linear-to-br from-red-950/55 via-black/55 to-red-900/45 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/25 p-8 md:p-12 space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            {/* Security Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/50">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              Verify Recipient Crypto Wallet Address
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              For security reasons, please validate the wallet address before proceeding with the transaction.
            </p>
          </div>

          {/* Wallet Input Section */}
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={walletAddress}
                readOnly
                onPaste={handleInputPaste}
                placeholder="Paste recipient wallet address"
                disabled={isValidating || validationStatus === 'success'}
                className="w-full px-6 py-4 pr-16 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner text-sm md:text-base"
              />
              
              {/* Clipboard Paste Button */}
              {!isValidating && validationStatus !== 'success' && (
                <button
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
                  title="Paste from clipboard"
                >
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                </button>
              )}
            </div>

            {isCheckingMemo && (
              <div className="rounded-xl border border-white/20 bg-black/35 px-4 py-3 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-red-400 animate-spin"></span>
                  <span>determining the chain of address</span>
                </div>
              </div>
            )}

            {memoChain && !isCheckingMemo && (
              <p className="text-sm text-gray-100">
                The recipient&apos;s crypto address you entered belongs to {memoChain} Blockchain
              </p>
            )}

            {memoCheckError && !isCheckingMemo && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {memoCheckError}
              </div>
            )}

            {isMemoRequired && !isCheckingMemo && (
              <div className="space-y-3 rounded-xl border border-white/20 bg-black/35 p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={memoTag}
                    readOnly
                    onPaste={handleMemoInputPaste}
                    placeholder="Enter memo/tag"
                    disabled={isValidating || validationStatus === 'success'}
                    className="w-full px-4 py-3 pr-14 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  />

                  {!isValidating && validationStatus !== 'success' && (
                    <button
                      onClick={handleMemoPaste}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
                      title="Paste memo/tag from clipboard"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-100">
                  The {memoChain} Blockchain address requires Memo information, so kindly provide these details
                </p>
              </div>
            )}

            {/* Continue Button */}
            {showButton && !validationStatus && (
              <button
                onClick={handleValidation}
                disabled={isValidating}
                className="w-full py-4 bg-black hover:bg-neutral-900 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 shadow-lg shadow-black/50 hover:shadow-black/70 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 animate-slideUp"
              >
                {isValidating ? (
                  <>
                    <svg 
                      className="animate-spin h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Validating...</span>
                  </>
                ) : (
                  <span>Start Security Validation</span>
                )}
              </button>
            )}

            {/* Validation Steps */}
            {isValidating && validationStep && (
              <div className="flex items-center justify-center space-x-3 py-4 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <p className="text-gray-300 text-sm md:text-base">{validationStep}</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          {!validationStatus && (
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
              <span>Your transaction is protected by end-to-end encryption</span>
            </div>
          )}
        </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full pt-6 pb-2 text-center">
        <p className="text-gray-500 text-xs md:text-sm">
          © 2026 CardNest. All rights reserved.
        </p>
      </footer>

      {validationStatus === 'success' && (
        <ApprovedModal
          points={approvedPoints}
          onContinue={() => {
            setValidationStatus(null);
          }}
        />
      )}

      {validationStatus === 'error' && (
        <InvalidModal
          message={validationMessage}
          points={invalidPoints}
          onRetry={handleRetry}
        />
      )}

      {isValidating && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-black/40 p-8 text-center shadow-2xl">
            <div className="mx-auto relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-red-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 border-r-rose-300 animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-red-500/80 animate-[spin_1.4s_linear_infinite_reverse]"></div>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">Verifying Address..</h3>
            <p className="mt-2 text-sm text-gray-300">
              {validationStep || 'Running security checks...' }
            </p>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
