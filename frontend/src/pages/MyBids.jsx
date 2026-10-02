import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import bidApi from '../api/bidApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';

export function MyBids() {
  const { isAdmin } = useAuth();
  const [bidsPage, setBidsPage] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyBids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bidApi.getMyBids(page, pageSize);
      if (data && data.content) {
        setBidsPage(data);
      } else if (Array.isArray(data)) {
        setBidsPage({ content: data, totalPages: 1, totalElements: data.length });
      }
    } catch (err) {
      console.error('Error fetching my bids:', err);
      setError(err.userMessage || 'Failed to load your bids.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (!isAdmin) {
      fetchMyBids();
    } else {
      setLoading(false);
    }
  }, [fetchMyBids, isAdmin]);

  const bids = bidsPage.content || [];

  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Placed Bids
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all auctions you have bid on and monitor your winning / outbid statuses.
          </p>
        </div>

        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Admin Account (Bidding Disabled)</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
            Administrators manage listings and cannot place bids. To inspect all competitive bids placed by buyers across the entire platform, open the Admin Console.
          </p>
          <Link to="/admin">
            <Button size="md" variant="primary" icon={ShieldCheck}>
              Open Admin Console
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Placed Bids
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track all auctions you have bid on and monitor your winning / outbid statuses.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Loading your bidding history..." />
        </div>
      ) : error ? (
        <ErrorMessage title="Unable to load bids" message={error} onRetry={fetchMyBids} />
      ) : bids.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">You haven't placed any bids yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Find items you love in the live marketplace and enter your first bid to start competing.
          </p>
          <Link to="/auctions">
            <Button size="sm" icon={Gavel}>
              Explore Live Auctions
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Auction Item</th>
                  <th className="py-4 px-6">My Bid</th>
                  <th className="py-4 px-6">Bid Placed Time</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bids.map((bid) => {
                  const auctionId = bid.auctionId || bid.auction?.id;
                  const title = bid.auctionTitle || bid.auction?.title || `Auction #${auctionId}`;
                  const amount = bid.amount ?? 0;
                  const time = bid.bidTime;

                  return (
                    <tr key={bid.bidId || bid.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/auctions/${auctionId}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {title}
                        </Link>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Auction ID: #{auctionId}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-indigo-600 text-base">
                        {formatCurrency(amount)}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {formatDateTime(time)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/auctions/${auctionId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Item</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {bidsPage.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {page + 1} of {bidsPage.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= bidsPage.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyBids;
