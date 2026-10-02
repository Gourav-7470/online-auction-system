import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { calculateTimeRemaining } from '../utils/formatters';

export function CountdownTimer({
  endTime,
  startTime = null,
  onExpire,
  compact = false,
  className = '',
}) {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeRemaining(endTime, startTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime, startTime);
      setTimeLeft(remaining);

      if (remaining.isEnded) {
        clearInterval(timer);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, startTime, onExpire]);

  if (timeLeft.isEnded) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1 text-xs ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Auction Ended</span>
      </div>
    );
  }

  if (timeLeft.isUpcoming) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 text-xs ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span>Starts in: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s</span>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-lg ${
          isUrgent
            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        } ${className}`}
      >
        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-600' : 'text-amber-600'}`} />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[54px] shadow-sm">
          <span className="text-xl font-extrabold tracking-tight">
            {pad(timeLeft.days)}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Days
          </span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[54px] shadow-sm">
        <span className="text-xl font-extrabold tracking-tight">
          {pad(timeLeft.hours)}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Hours
        </span>
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-3 py-2 min-w-[54px] shadow-sm">
        <span className="text-xl font-extrabold tracking-tight">
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Mins
        </span>
      </div>
      <div
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[54px] shadow-sm ${
          isUrgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'
        }`}
      >
        <span className="text-xl font-extrabold tracking-tight">
          {pad(timeLeft.seconds)}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider">
          Secs
        </span>
      </div>
    </div>
  );
}

export default CountdownTimer;
