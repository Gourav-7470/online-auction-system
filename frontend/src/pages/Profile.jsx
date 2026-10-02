import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Bell,
  Bookmark,
  CheckCircle2,
  Trash2,
  ExternalLink,
  CheckCheck,
  Calendar,
} from 'lucide-react';
import notificationApi from '../api/notificationApi';
import watchlistApi from '../api/watchlistApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import Button from '../components/Button';
import LoadingSpinner from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Load Notifications
      try {
        const notifData = await notificationApi.getMyNotifications();
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch {
        setNotifications([]);
      }

      // Load Watchlist
      try {
        const watchData = await watchlistApi.getMyWatchlist();
        setWatchlist(Array.isArray(watchData) ? watchData : []);
      } catch {
        setWatchlist([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  // Remove item from watchlist
  const handleRemoveWatchlist = async (auctionId) => {
    try {
      await watchlistApi.removeFromWatchlist(auctionId);
      setWatchlist((prev) => prev.filter((w) => (w.auction?.id || w.id) !== auctionId));
      toast.info('Item removed from watchlist');
    } catch (err) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-md shadow-indigo-600/30">
            {user?.username?.substring(0, 2) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user?.name || user?.username}
              </h1>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email || `${user?.username}@bidzone.com`}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Active Spring Security Session</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'watchlist'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My Watchlist</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
            {watchlist.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Loading profile details..." />
        </div>
      ) : activeTab === 'notifications' ? (
        /* Notifications View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg">System Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={CheckCheck}
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No notifications right now</p>
              <p className="text-xs mt-1">
                You will be notified here when you win auctions or receive updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`py-4 flex items-start justify-between gap-4 transition-colors ${
                    !notif.isRead ? 'bg-indigo-50/40 p-4 rounded-2xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        !notif.isRead
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {notif.message}
                      </p>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {formatDateTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap p-1"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Watchlist View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg">Saved Auctions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep an eye on items you intend to bid on
            </p>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Your watchlist is currently empty</p>
              <p className="text-xs mt-1 mb-4">
                Click the bookmark icon on any auction card to save it here.
              </p>
              <Link to="/auctions">
                <Button size="sm">Browse Auctions</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item) => {
                const auction = item.auction || item;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <Link
                        to={`/auctions/${auction.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 text-sm line-clamp-1"
                      >
                        {auction.title || `Auction #${auction.id}`}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current: <strong className="text-slate-800">{formatCurrency(auction.currentPrice ?? auction.startingPrice)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/auctions/${auction.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        title="View Auction"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleRemoveWatchlist(auction.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
