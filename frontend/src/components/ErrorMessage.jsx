import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'We were unable to complete your request. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-8 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-rose-950 mb-2">{title}</h3>
      <p className="text-sm text-rose-700 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="border-rose-300 text-rose-800 hover:bg-rose-100 hover:border-rose-400"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorMessage;
