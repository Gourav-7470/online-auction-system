import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Gavel,
  TrendingUp,
  Award,
  Bookmark,
  Bell,
  PlusCircle,
  Eye,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import dashboardApi from '../api/dashboardApi';
import bidApi from '../api/bidApi';
import auctionApi from '../api/auctionApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import Button from '../components/Button';
import LoadingSpinner from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const dashboardMetrics = await dashboardApi.getMyDashboard();
      setStats(dashboardMetrics);

      // Fetch recent bids for activity stream (only for non-admin bidders)
      if (!isAdmin) {
        try {
          const bidsData = await bidApi.getMyBids(0, 5);
          const bidItems = bidsData.content || (Array.isArray(bidsData) ? bidsData : []);
          setRecentBids(bidItems);
        } catch {
          setRecentBids([]);
        }
      }

      // Fetch active auctions for quick glance
      try {
        const auctionsData = await auctionApi.getActiveAuctions();
        const auctionItems = Array.isArray(auctionsData) ? auctionsData.slice(0, 4) : [];
        setRecentAuctions(auctionItems);
      } catch {
        setRecentAuctions([]);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.userMessage || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading your dashboard analytics..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage
          title="Dashboard unavailable"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Welcome back, {stats?.username || user?.username}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Account Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Monitor your live competitive bids, manage listed auctions, and review your won items.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link to="/auctions">
            <Button
              variant={isAdmin ? 'outline' : 'gold'}
              size="sm"
              icon={Gavel}
              className={
                isAdmin
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm'
                  : 'font-bold text-slate-950 shadow-md shadow-amber-500/20'
              }
            >
              Browse Auctions
            </Button>
          </Link>
          {isAdmin ? (
            <Link to="/create-auction">
              <Button
                variant="gold"
                size="sm"
                icon={PlusCircle}
                className="font-bold text-slate-950 shadow-md shadow-amber-500/20"
              >
                Create Auction
              </Button>
            </Link>
          ) : (
            <Link to="/my-bids">
              <Button
                variant="outline"
                size="sm"
                icon={TrendingUp}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              >
                My Bids
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Primary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {!isAdmin ? (
          <>
            {/* Total Bids */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Bids Placed
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {stats?.totalBids ?? 0}
                </span>
              </div>
            </div>

            {/* Won Auctions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Auctions Won
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">
                  {stats?.wonAuctions ?? 0}
                </span>
              </div>
            </div>

            {/* Winning Amount */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Won Value
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {formatCurrency(stats?.totalWinningAmount ?? 0)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Total System Auctions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Listings
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {stats?.totalAuctions ?? 0}
                </span>
              </div>
            </div>

            {/* Active Live Auctions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Live Auctions
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">
                  {stats?.activeAuctions ?? 0}
                </span>
              </div>
            </div>

            {/* Closed Auctions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Closed Listings
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {stats?.closedAuctions ?? 0}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Watchlist Count */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Saved in Watchlist
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {stats?.watchlistCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Status Summary (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Quick Navigation</h3>
            <div className="space-y-2.5">
              {!isAdmin && (
                <Link
                  to="/my-bids"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group text-sm font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    <span>View My Bids</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/my-auctions"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group text-sm font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    <span>My Listed Auctions</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group text-sm font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span>Watchlist & Notifications</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 text-amber-900 transition-colors group text-sm font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Admin Control Console</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Auction Overview Pill */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Auction Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Total System Auctions</span>
                <span className="font-bold text-slate-800">{stats?.totalAuctions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Active Live Auctions</span>
                <span className="font-bold text-emerald-600">{stats?.activeAuctions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Closed / Completed</span>
                <span className="font-bold text-slate-600">{stats?.closedAuctions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Unread Notifications</span>
                <span className="font-bold text-indigo-600">
                  {stats?.unreadNotifications ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Bids Feed - Only visible to non-admin bidders */}
          {!isAdmin && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-lg">My Recent Bids</h3>
                </div>
                <Link
                  to="/my-bids"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </Link>
              </div>

              {recentBids.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No recent bids found. Go to the marketplace to place your first bid!
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentBids.map((bid) => {
                    const id = bid.auctionId || bid.auction?.id;
                    const title = bid.auctionTitle || bid.auction?.title || `Auction #${id}`;
                    return (
                      <div key={bid.bidId || bid.id} className="py-3 flex items-center justify-between">
                        <div>
                          <Link
                            to={`/auctions/${id}`}
                            className="font-bold text-sm text-slate-800 hover:text-indigo-600 line-clamp-1"
                          >
                            {title}
                          </Link>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {formatDateTime(bid.bidTime)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-sm text-indigo-600 block">
                            {formatCurrency(bid.amount)}
                          </span>
                          <Link
                            to={`/auctions/${id}`}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                          >
                            View Item
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Live Active Auctions Quick Watch */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Currently Live on Marketplace</h3>
              </div>
              <Link
                to="/auctions?status=ACTIVE"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                See All
              </Link>
            </div>

            {recentAuctions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active auctions currently running.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentAuctions.map((a) => (
                  <Link
                    key={a.id}
                    to={`/auctions/${a.id}`}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Live Auction
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mt-0.5">
                        {a.title}
                      </h4>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Current Bid:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(a.currentPrice ?? a.startingPrice)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
