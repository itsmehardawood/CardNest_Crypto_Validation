'use client';

import { useState, useEffect } from 'react';

export default function CryptoValidatePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState('');
  const [validationStatus, setValidationStatus] = useState(null); // 'success' | 'error' | null
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(walletAddress.trim().length > 0);
  }, [walletAddress]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleValidation = async () => {
    setIsValidating(true);
    setValidationStatus(null);

    // Step 1: Checking wallet format
    setValidationStep('Checking wallet format…');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Verifying network
    setValidationStep('Verifying network…');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 3: Running security scan
    setValidationStep('Running security scan…');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Randomly simulate success or error
    const isSuccess = Math.random() > 0.3;
    setValidationStatus(isSuccess ? 'success' : 'error');
    setIsValidating(false);
    setValidationStep('');
  };

  const handleRetry = () => {
    setValidationStatus(null);
    setWalletAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
      
      {/* Main Content Container */}
      <div className="relative w-full max-w-2xl z-10">
        
        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-12 space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            {/* Security Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/50">
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
            
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Verify Wallet Address
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
                onChange={(e) => setWalletAddress(e.target.value)}
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

            {/* Continue Button */}
            {showButton && !validationStatus && (
              <button
                onClick={handleValidation}
                disabled={isValidating}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 animate-slideUp"
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
                  <span>Continue</span>
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

            {/* Success State */}
            {validationStatus === 'success' && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6 animate-slideUp">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-6 h-6 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-400 font-semibold text-lg mb-1">
                      Verification Successful
                    </h3>
                    <p className="text-green-300/90 text-sm">
                      Wallet address verified successfully. You may proceed with the transaction.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {validationStatus === 'error' && (
              <div className="space-y-4 animate-slideUp">
                <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/50 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <svg 
                          className="w-6 h-6 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-400 font-semibold text-lg mb-1">
                        Verification Failed
                      </h3>
                      <p className="text-red-300/90 text-sm">
                        Invalid wallet address or network mismatch. Please verify and try again.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Retry Button */}
                <button
                  onClick={handleRetry}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Try Again
                </button>
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

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-gray-500 text-xs md:text-sm">
            © 2026 CardNest. All rights reserved.
          </p>
        </footer>
      </div>

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
