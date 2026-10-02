import React from 'react';
import { getStatusInfo } from '../utils/formatters';

export function Badge({ status, variant, children, size = 'sm', className = '' }) {
  if (status) {
    const info = getStatusInfo(status);
    const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${info.bg} ${info.text} ${info.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${info.dot} ${status.toUpperCase() === 'ACTIVE' ? 'animate-ping' : ''}`} />
        <span>{children || info.label}</span>
      </span>
    );
  }

  const variants = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-slate-900 text-slate-100 border-slate-700',
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${
        variants[variant] || variants.neutral
      } ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
