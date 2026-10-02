import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Gavel,
  Users,
  Layers,
  Lock,
  RotateCcw,
  Trash2,
  Eye,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import bidApi from '../api/bidApi';
import userApi from '../api/userApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('auctions');
  const [auctions, setAuctions] = useState([]);
  const [allBids, setAllBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search/Filter state
  const [auctionFilter, setAuctionFilter] = useState('');
  const [bidFilter, setBidFilter] = useState('');

  // Modals for admin actions
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isRelistModalOpen, setIsRelistModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [relistStart, setRelistStart] = useState('');
  const [relistEnd, setRelistEnd] = useState('');

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all auctions
      try {
        const auctionList = await auctionApi.getAllAuctions();
        setAuctions(Array.isArray(auctionList) ? auctionList : []);
      } catch (err) {
        console.warn('Failed to load all auctions for admin:', err);
      }

      // Load all bids (requires ADMIN)
      try {
        const bidList = await bidApi.getAllBids();
        setAllBids(Array.isArray(bidList) ? bidList : []);
      } catch (err) {
        console.warn('Failed to load all bids for admin:', err);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load admin panel data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Close Auction Action
  const handleCloseAuction = async () => {
    if (!selectedAuction) return;
    try {
      setActionLoading(true);
      await auctionApi.closeAuction(selectedAuction.id);
      toast.success(`Auction #${selectedAuction.id} closed.`);
      setIsCloseModalOpen(false);
      setSelectedAuction(null);
      loadAdminData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to close auction');
    } finally {
      setActionLoading(false);
    }
  };

  // Relist Auction Action
  const handleRelistAuction = async (e) => {
    e.preventDefault();
    if (!relistStart || !relistEnd) {
      toast.error('Both start and end dates are required');
      return;
    }
    try {
      setActionLoading(true);
      await auctionApi.relistAuction(selectedAuction.id, relistStart, relistEnd);
      toast.success(`Auction #${selectedAuction.id} relisted.`);
      setIsRelistModalOpen(false);
      setSelectedAuction(null);
      loadAdminData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to relist auction');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Auction Action
  const handleDeleteAuction = async () => {
    if (!selectedAuction) return;
    try {
      setActionLoading(true);
      await auctionApi.deleteAuction(selectedAuction.id);
      toast.success(`Auction #${selectedAuction.id} permanently deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedAuction(null);
      loadAdminData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete auction');
    } finally {
      setActionLoading(false);
    }
  };

  const activeAuctionsCount = auctions.filter(
    (a) => a.status?.toUpperCase() === 'ACTIVE'
  ).length;
  const closedAuctionsCount = auctions.filter(
    (a) => a.status?.toUpperCase() === 'CLOSED'
  ).length;

  const filteredAuctions = auctions.filter((a) => {
    if (!auctionFilter.trim()) return true;
    const term = auctionFilter.toLowerCase();
    return (
      (a.title || '').toLowerCase().includes(term) ||
      (a.createdBy || '').toLowerCase().includes(term) ||
      String(a.id).includes(term)
    );
  });

  const filteredBids = allBids.filter((b) => {
    if (!bidFilter.trim()) return true;
    const term = bidFilter.toLowerCase();
    return (
      (b.bidderUsername || '').toLowerCase().includes(term) ||
      String(b.auction?.id || b.auctionId || '').includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage auctions, oversee bids, and enforce platform integrity.
          </p>
        </div>

        <Link to="/create-auction">
          <Button variant="primary" size="md" icon={Gavel}>
            Create Auction (Admin)
          </Button>
        </Link>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Auctions
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {auctions.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Auctions
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">
              {activeAuctionsCount}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Closed Auctions
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {closedAuctionsCount}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              All System Bids
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {allBids.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('auctions')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'auctions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Manage Auctions ({auctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bids')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bids'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Audit Bids Log ({allBids.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Loading admin database..." />
        </div>
      ) : activeTab === 'auctions' ? (
        /* Auction Management Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-lg">Platform Auctions</h3>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search auctions or seller..."
                value={auctionFilter}
                onChange={(e) => setAuctionFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Starting</th>
                  <th className="py-3 px-4">Current</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAuctions.map((a) => {
                  const isClosed = a.status?.toUpperCase() === 'CLOSED';
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">#{a.id}</td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/auctions/${a.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                        >
                          {a.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={a.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatCurrency(a.startingPrice)}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600">
                        {formatCurrency(a.currentPrice ?? a.startingPrice)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{a.createdBy || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDateTime(a.endTime)}</td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          to={`/auctions/${a.id}`}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 inline-block"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {!isClosed && (
                          <button
                            onClick={() => {
                              setSelectedAuction(a);
                              setIsCloseModalOpen(true);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Close Auction"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        {isClosed && (
                          <button
                            onClick={() => {
                              setSelectedAuction(a);
                              setIsRelistModalOpen(true);
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Relist Auction"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAuction(a);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Auction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Bids Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-lg">System-Wide Bidding Audit Log</h3>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search bidder or auction ID..."
                value={bidFilter}
                onChange={(e) => setBidFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Bid ID</th>
                  <th className="py-3 px-4">Bidder Username</th>
                  <th className="py-3 px-4">Auction Item</th>
                  <th className="py-3 px-4">Bid Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBids.map((b) => (
                  <tr key={b.id || b.bidId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">#{b.id || b.bidId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {b.bidderUsername}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/auctions/${b.auction?.id || b.auctionId}`}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        {b.auction?.title || `Auction #${b.auction?.id || b.auctionId}`}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-600">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDateTime(b.bidTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Admin: Close Auction"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to trigger <code>closeAuction({selectedAuction?.id})</code>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCloseModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={actionLoading} onClick={handleCloseAuction}>
            Confirm Close
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isRelistModalOpen}
        onClose={() => setIsRelistModalOpen(false)}
        title="Admin: Relist Auction"
      >
        <form onSubmit={handleRelistAuction} className="space-y-4">
          <p className="text-xs text-slate-500 mb-2">
            Configure new start and end timestamps for auction #{selectedAuction?.id}.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={relistStart}
              onChange={(e) => setRelistStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              required
              value={relistEnd}
              onChange={(e) => setRelistEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsRelistModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Relist Auction
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Admin: Delete Auction"
      >
        <p className="text-sm text-slate-600 mb-6">
          Permanently delete auction #{selectedAuction?.id} (
          <strong>{selectedAuction?.title}</strong>)?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={actionLoading} onClick={handleDeleteAuction}>
            Delete Listing
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
