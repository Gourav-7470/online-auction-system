// Utility functions for formatting currency, dates, countdowns, and auction statuses

/**
 * Format a number into Indian Rupee (INR) currency format
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Format ISO datetime string into readable date & time
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format ISO datetime string into short date
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Return human relative time string (e.g. '5 mins ago')
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 5) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return formatDate(date);
}

/**
 * Calculate remaining time until target date
 * @param {string|Date} endTime
 * @param {string|Date} [startTime]
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isEnded: boolean, isUpcoming: boolean, totalMs: number }}
 */
export function calculateTimeRemaining(endTime, startTime = null) {
  const now = new Date().getTime();
  const end = endTime ? new Date(endTime).getTime() : 0;
  const start = startTime ? new Date(startTime).getTime() : 0;

  if (startTime && start > now) {
    const diff = start - now;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isEnded: false,
      isUpcoming: true,
      totalMs: diff,
    };
  }

  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
      isUpcoming: false,
      totalMs: 0,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isEnded: false,
    isUpcoming: false,
    totalMs: diff,
  };
}

/**
 * Get status badge style and label
 * @param {string} status
 * @returns {{ label: string, color: string, bg: string, text: string, border: string }}
 */
export function getStatusInfo(status) {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
      return {
        label: 'Live Now',
        color: 'emerald',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'UPCOMING':
      return {
        label: 'Upcoming',
        color: 'indigo',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        color: 'slate',
        bg: 'bg-slate-500/10',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'WINNING':
    case 'WON':
      return {
        label: 'Won',
        color: 'green',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'OUTBID':
    case 'LOST':
      return {
        label: 'Outbid',
        color: 'amber',
        bg: 'bg-amber-500/10',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    default:
      return {
        label: status || 'Pending',
        color: 'slate',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}
