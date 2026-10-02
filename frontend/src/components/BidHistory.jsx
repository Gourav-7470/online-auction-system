import React from 'react';
import { History, Award, UserCheck, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/formatters';

export function BidHistory({ bids = [], currentHighestBid = null, className = '' }) {
  // Anonymize bidder name slightly for privacy (e.g., 'john_doe' -> 'jo***oe' or 'User: j***e')
  const maskUsername = (username) => {
    if (!username) return 'Anonymous';
    if (username.length <= 3) return username;
    const first = username.substring(0, 2);
    const last = username.substring(username.length - 2);
    return `${first}***${last}`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">Bid History</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {bids.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No bids yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Be the first bidder to set the benchmark for this item!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {bids.map((bid, index) => {
            const isHighest = index === 0;
            const bidderName = bid.bidderUsername || 'Bidder';
            const amount = bid.amount ?? 0;
            const time = bid.bidTime;

            return (
              <div
                key={bid.id || bid.bidId || `${index}-${amount}`}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isHighest ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                      isHighest
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bidderName.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">
                        {maskUsername(bidderName)}
                      </span>
                      {isHighest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3 text-indigo-600" />
                          Highest Bid
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5" title={formatDateTime(time)}>
                      {formatRelativeTime(time)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-extrabold block tracking-tight ${
                      isHighest ? 'text-indigo-600' : 'text-slate-800'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Verified Bid</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BidHistory;
