import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-indigo-600`} />
      {message && <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="h-52 bg-slate-200 w-full" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 bg-slate-200 rounded w-16" />
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-9 bg-slate-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-b border-slate-100 px-6 flex items-center gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
          <div className="h-4 bg-slate-200 rounded w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
