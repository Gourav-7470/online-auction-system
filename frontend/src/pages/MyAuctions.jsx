import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Gavel,
  PlusCircle,
  Eye,
  Lock,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getAuctionImage } from '../utils/imageMapper';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function MyAuctions() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal actions
  const [actionAuction, setActionAuction] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auctionApi.getMyAuctions();
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch my auctions error:', err);
      setError(err.userMessage || 'Unable to load your auctions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAuctions();
  }, [fetchMyAuctions]);

  // Handle Close Auction
  const handleCloseAuction = async () => {
    if (!actionAuction) return;
    try {
      setActionLoading(true);
      await auctionApi.closeAuction(actionAuction.id);
      toast.success(`Auction #${actionAuction.id} closed.`);
      setIsCloseModalOpen(false);
      setActionAuction(null);
      fetchMyAuctions();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to close auction');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Auction
  const handleDeleteAuction = async () => {
    if (!actionAuction) return;
    try {
      setActionLoading(true);
      await auctionApi.deleteAuction(actionAuction.id);
      toast.success(`Auction #${actionAuction.id} deleted.`);
      setIsDeleteModalOpen(false);
      setActionAuction(null);
      fetchMyAuctions();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete auction');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAuctions = auctions.filter((a) => {
    if (selectedStatus === 'ALL') return true;
    return (a.status || '').toUpperCase() === selectedStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Listed Auctions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your listings, monitor highest bids, and finalize auctions.
          </p>
        </div>

        <Link to="/create-auction">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Create New Listing
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'ACTIVE', 'UPCOMING', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === tab
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Auctions' : tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Loading your auctions..." />
        </div>
      ) : error ? (
        <ErrorMessage title="Unable to load listings" message={error} onRetry={fetchMyAuctions} />
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No auctions found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You haven't listed any auctions under this status yet.
          </p>
          <Link to="/create-auction">
            <Button size="sm" icon={PlusCircle}>
              List Your First Item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => {
            const imageUrl = getAuctionImage(auction);
            const isClosed = auction.status?.toUpperCase() === 'CLOSED';

            return (
              <div
                key={auction.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900">
                    <img
                      src={imageUrl}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge status={auction.status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {auction.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Starting</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(auction.startingPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Current Bid</span>
                        <span className="font-bold text-indigo-600">
                          {formatCurrency(auction.currentPrice ?? auction.startingPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ends: {formatDateTime(auction.endTime)}</span>
                      </div>
                      {auction.winnerUsername && (
                        <div className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          Won by: {auction.winnerUsername}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/auctions/${auction.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      {!isClosed && (
                        <button
                          onClick={() => {
                            setActionAuction(auction);
                            setIsCloseModalOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActionAuction(auction);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modals */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Confirm Close"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to close auction <strong>"{actionAuction?.title}"</strong>?
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
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete auction <strong>"{actionAuction?.title}"</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={actionLoading} onClick={handleDeleteAuction}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default MyAuctions;
