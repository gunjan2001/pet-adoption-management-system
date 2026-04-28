/**
 * Production-grade error UI component with smart retry logic
 * Handles different error types with appropriate messaging and actions
 */
import { categorizeError, getRetryDelay } from '@/lib/errorHandler';
import { AlertCircle, ArrowRight, ChevronRight, Home, RefreshCw, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ErrorBoundaryUIProps {
  error: unknown;
  onRetry?: () => void | Promise<void>;
  onClearFilters?: () => void;
  isLoading?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

const ERROR_ICONS: Record<string, React.ReactNode> = {
  network: <Wifi className="w-12 h-12 text-blue-500" />,
  timeout: <RefreshCw className="w-12 h-12 text-orange-500" />,
  'not-found': <AlertCircle className="w-12 h-12 text-amber-500" />,
  unauthorized: <AlertCircle className="w-12 h-12 text-red-500" />,
  validation: <AlertCircle className="w-12 h-12 text-yellow-500" />,
  server: <AlertCircle className="w-12 h-12 text-red-500" />,
  unknown: <AlertCircle className="w-12 h-12 text-gray-500" />,
};

const ERROR_TITLES: Record<string, string> = {
  network: 'Connection Issue',
  timeout: 'Request Timed Out',
  'not-found': 'Not Found',
  unauthorized: 'Session Expired',
  validation: 'Invalid Filters',
  server: 'Server Error',
  unknown: 'Something Went Wrong',
};

export default function ErrorBoundaryUI({
  error,
  onRetry,
  onClearFilters,
  isLoading = false,
  retryCount = 0,
  maxRetries = 3,
}: ErrorBoundaryUIProps) {
  const errorInfo = categorizeError(error);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);

  // Auto-retry for transient errors on first failure
  useEffect(() => {
    if (
      errorInfo.isRetryable &&
      retryCount === 0 &&
      retryCount < maxRetries &&
      ['network', 'timeout', 'server'].includes(errorInfo.type)
    ) {
      setIsAutoRetrying(true);
      console.log(`Auto-retrying due to ${errorInfo.type} error...`);

      const delay = getRetryDelay(1);
      const timer = window.setTimeout(() => {
        onRetry?.();
      }, delay);

      setRetryTimer(timer);

      return () => clearTimeout(timer);
    } else {
      // Log error if not auto-retrying
      console.error('Error occurred:', error);
    }
  }, [error, errorInfo.isRetryable, retryCount, maxRetries, onRetry, errorInfo.type]);

  const canRetry = errorInfo.isRetryable && retryCount < maxRetries;
  const isRetrying = isLoading && isAutoRetrying;

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Auto-retry indicator */}
        {isRetrying && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-700">
              Attempting to recover... (attempt {retryCount + 1} of {maxRetries})
            </p>
          </div>
        )}

        {/* Error card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          {/* Header with icon and title */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-8 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">
              {ERROR_ICONS[errorInfo.type]}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {ERROR_TITLES[errorInfo.type]}
            </h2>
            {errorInfo.type === 'server' && (
              <p className="text-xs text-gray-500">Error Code: {errorInfo.statusCode || 'Unknown'}</p>
            )}
          </div>

          {/* Message and context */}
          <div className="px-6 py-6 space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {errorInfo.message}
            </p>

            {/* Type-specific helpful hints */}
            {errorInfo.type === 'network' && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 border border-blue-200">
                Check your internet connection and try again.
              </div>
            )}

            {errorInfo.type === 'timeout' && (
              <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-700 border border-orange-200">
                The server is taking longer than expected. Try again or come back in a moment.
              </div>
            )}

            {errorInfo.type === 'validation' && (
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700 border border-yellow-200 space-y-2">
                <p>Your filter criteria may be too restrictive.</p>
                {onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-yellow-800 font-semibold hover:text-yellow-900 text-sm underline"
                  >
                    Clear all filters →
                  </button>
                )}
              </div>
            )}

            {errorInfo.type === 'unauthorized' && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 border border-red-200">
                Please log in again to continue browsing.
              </div>
            )}

            {errorInfo.type === 'not-found' && (
              <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700 border border-amber-200">
                This resource is no longer available. Try searching or adjusting your filters.
              </div>
            )}

            {/* Max retries warning */}
            {!canRetry && errorInfo.isRetryable && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 border border-red-200">
                We've tried several times without success. Please try again later.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 space-y-2">
            {/* Primary: Retry */}
            {canRetry && (
              <button
                onClick={() => {
                  setIsAutoRetrying(false);
                  onRetry?.();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? `Retrying...` : 'Try Again'}
              </button>
            )}

            {/* Secondary: Clear filters */}
            {onClearFilters && errorInfo.type === 'validation' && (
              <button
                onClick={onClearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                Clear Filters
              </button>
            )}

            {/* Secondary: Go home */}
            {errorInfo.type === 'not-found' && (
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </a>
            )}

            {/* Secondary: Go to login */}
            {errorInfo.type === 'unauthorized' && (
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Go to Login
              </a>
            )}

            {/* Support link */}
            {/* {showContactSupport && (
              <a
                href="mailto:support@petadopt.com"
                className="text-center text-sm text-gray-500 hover:text-amber-600 transition-colors py-2"
              >
                Still having issues? <span className="underline font-medium">Contact support</span>
              </a>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
