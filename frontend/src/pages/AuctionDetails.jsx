import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Clock,
  Shield,
  User,
  Calendar,
  Bookmark,
  Share2,
  ArrowLeft,
  Award,
  AlertTriangle,
  Radio,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import bidApi from '../api/bidApi';
import watchlistApi from '../api/watchlistApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getAuctionImage, getAuctionPhotos } from '../utils/imageMapper';
import CountdownTimer from '../components/CountdownTimer';
import Badge from '../components/Badge';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import LoadingSpinner from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useAuctionWebSocket } from '../hooks/useAuctionWebSocket';

export function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const toast = useToast();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Admin action dialog states
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isRelistModalOpen, setIsRelistModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [relistStartTime, setRelistStartTime] = useState('');
  const [relistEndTime, setRelistEndTime] = useState('');

  // Fetch auction details and bid history
  const loadAuctionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch auction by ID
      const auctionData = await auctionApi.getAuctionById(id);
      setAuction(auctionData);

      // Fetch bid history for this auction
      try {
        const bidHistory = await bidApi.getBidsByAuction(id);
        setBids(Array.isArray(bidHistory) ? bidHistory : []);
      } catch {
        setBids([]);
      }

      // If closed, fetch winner details
      if (auctionData.status === 'CLOSED') {
        try {
          const result = await auctionApi.getAuctionResult(id);
          setWinnerInfo(result);
        } catch {
          // Fallback
        }
      }

      // Check if user has watchlisted this
      if (isAuthenticated) {
        try {
          const watchlist = await watchlistApi.getMyWatchlist();
          const found = watchlist.some((w) => (w.auction?.id || w.id) === Number(id));
          setIsWatchlisted(found);
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Error loading auction:', err);
      setError(err.userMessage || 'Failed to load auction details.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadAuctionData();
  }, [loadAuctionData]);

  // Real-Time WebSocket Handler for Incoming Bids
  const handleIncomingWebSocketBid = useCallback(
    (newBid) => {
      // Normalize incoming bid object
      const amount = newBid.amount ?? newBid.currentPrice;
      const bidder = newBid.bidderUsername || 'Someone';

      // Instantly update current auction price and trigger visual animation
      setAuction((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPrice: amount,
        };
      });

      // Instantly prepend new bid to bid history list
      setBids((prev) => {
        const existing = prev.find((b) => (b.id && b.id === newBid.id) || (b.bidId && b.bidId === newBid.bidId));
        if (existing) return prev;
        return [newBid, ...prev];
      });

      // Show real-time live alert toast
      toast.bid({
        title: auction?.title || 'Auction Update',
        amount,
        bidder,
        message: `New bid placed: ${formatCurrency(amount)}`,
      });
    },
    [auction?.title, toast]
  );

  // Hook into WebSocket
  const { isConnected: isWsConnected } = useAuctionWebSocket(id, handleIncomingWebSocketBid);

  // Successful local bid placement callback
  const handleBidSuccess = (placedBid, amount) => {
    setAuction((prev) => ({
      ...prev,
      currentPrice: amount,
    }));
    setBids((prev) => [placedBid, ...prev]);
  };

  // Watchlist Toggle
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast.warning('Please log in to add items to your watchlist');
      return;
    }
    try {
      if (isWatchlisted) {
        await watchlistApi.removeFromWatchlist(auction.id);
        setIsWatchlisted(false);
        toast.info('Removed from watchlist');
      } else {
        await watchlistApi.addToWatchlist(auction.id);
        setIsWatchlisted(true);
        toast.success('Added to watchlist');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update watchlist');
    }
  };

  // Admin: Close Auction
  const handleCloseAuction = async () => {
    try {
      setAdminActionLoading(true);
      await auctionApi.closeAuction(auction.id);
      toast.success('Auction successfully closed!');
      setIsCloseModalOpen(false);
      loadAuctionData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to close auction');
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Admin: Relist Auction
  const handleRelistAuction = async (e) => {
    e.preventDefault();
    if (!relistStartTime || !relistEndTime) {
      toast.error('Both start and end dates are required');
      return;
    }
    try {
      setAdminActionLoading(true);
      await auctionApi.relistAuction(auction.id, relistStartTime, relistEndTime);
      toast.success('Auction successfully relisted!');
      setIsRelistModalOpen(false);
      loadAuctionData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to relist auction');
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Admin: Delete Auction
  const handleDeleteAuction = async () => {
    try {
      setAdminActionLoading(true);
      await auctionApi.deleteAuction(auction.id);
      toast.success('Auction deleted successfully');
      navigate('/auctions');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete auction');
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading live auction stream..." size="lg" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage
          title="Auction not found"
          message={error || 'The requested auction does not exist or may have been removed.'}
          onRetry={loadAuctionData}
        />
        <div className="text-center mt-6">
          <Link to="/auctions">
            <Button variant="outline" icon={ArrowLeft}>
              Back to All Auctions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const photos = getAuctionPhotos(auction);
  const activePhoto = photos[selectedPhotoIndex] || getAuctionImage(auction);
  const currentPrice = auction.currentPrice ?? auction.startingPrice ?? 0;
  const isClosed = auction.status?.toUpperCase() === 'CLOSED';
  const isActive = auction.status?.toUpperCase() === 'ACTIVE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button and status indicator bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auctions</span>
        </Link>

        {/* Live WebSocket Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isWsConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'animate-pulse text-emerald-600' : 'text-amber-500'}`} />
            <span>{isWsConnected ? 'Live Real-Time Stream' : 'Connecting Stream...'}</span>
          </div>

          <button
            onClick={handleWatchlistToggle}
            className={`p-2 rounded-xl border transition-colors ${
              isWatchlisted
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery and Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Multi-Photo Interactive Gallery */}
          <div className="space-y-3">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md group">
              <img
                src={activePhoto}
                alt={auction.title}
                className="w-full h-[360px] sm:h-[460px] object-cover object-center transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge status={auction.status} size="md" />
              </div>

              {/* Photo Index Indicator */}
              {photos.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold border border-white/10 shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Photo {selectedPhotoIndex + 1} of {photos.length}
                  </span>
                </div>
              )}

              {/* Arrow navigation buttons */}
              {photos.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                    }
                    className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white pointer-events-auto backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                    }
                    className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white pointer-events-auto backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Seller info pill */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Listed by: <strong className="text-white font-semibold">{auction.createdBy || 'Verified Seller'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Authentic</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
                {photos.map((photo, idx) => {
                  const isSelected = selectedPhotoIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-400/50 scale-105 shadow-md'
                          : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                      }`}
                      aria-label={`Select photo ${idx + 1}`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-[9px] font-bold text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                          Cover
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Auction #{auction.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {auction.title}
              </h1>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Item Description
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {auction.description ||
                  'No detailed description provided for this listing. All bids are legally binding and covered by BidZone customer protection.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Starting Price
                </span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {formatCurrency(auction.startingPrice)}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Start Date
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {formatDateTime(auction.startTime)}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  End Date
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {formatDateTime(auction.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Management Toolbar (Only visible to ADMIN users) */}
          {isAdmin && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Admin Control Panel
                </h3>
              </div>
              <p className="text-xs text-amber-800 mb-4 leading-relaxed">
                As an Administrator, you can manage this auction directly with the backend Spring Boot endpoints.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {!isClosed && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsCloseModalOpen(true)}
                    icon={Lock}
                  >
                    Close Auction
                  </Button>
                )}
                {isClosed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRelistModalOpen(true)}
                    icon={RotateCcw}
                  >
                    Relist Auction
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  icon={Trash2}
                >
                  Delete Listing
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-time Bidding & Live Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Winner Banner if Closed */}
          {isClosed && (
            <div className="bg-gradient-to-tr from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Auction Closed</h3>
                  <span className="text-xs text-emerald-300 font-semibold">Official Final Result</span>
                </div>
              </div>

              {auction.winnerUsername || winnerInfo?.winnerUsername ? (
                <div className="space-y-2 mt-4 bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-2xl">
                  <p className="text-xs text-emerald-200">
                    Winner:{' '}
                    <span className="font-extrabold text-white text-sm">
                      {auction.winnerUsername || winnerInfo?.winnerUsername}
                    </span>
                  </p>
                  <p className="text-xs text-emerald-200">
                    Winning Bid:{' '}
                    <span className="font-extrabold text-emerald-400 text-lg">
                      {formatCurrency(auction.winningAmount || winnerInfo?.winningAmount || currentPrice)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-300 mt-2">
                  This auction ended without any qualifying bids meeting the starting reserve price.
                </p>
              )}
            </div>
          )}

          {/* Active Countdown Card */}
          {isActive && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Time Remaining in Auction
              </span>
              <CountdownTimer
                endTime={auction.endTime}
                startTime={auction.startTime}
                onExpire={() => {
                  toast.info('Auction duration has ended. Finalizing winner...');
                  loadAuctionData();
                }}
                className="justify-center"
              />
            </div>
          )}

          {/* Prominent Bidding Form (Only for buyer accounts, NOT admin) */}
          {!isAdmin ? (
            <BidForm
              auction={auction}
              onBidSuccess={handleBidSuccess}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm text-center bg-gradient-to-b from-white to-amber-50/40">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Admin Mode (Bidding Restricted)
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                As an Administrator, you manage this auction listing. Admin accounts are restricted from placing bids under platform security policy.
              </p>
            </div>
          )}

          {/* Live Bid History Feed */}
          <BidHistory
            bids={bids}
            currentHighestBid={currentPrice}
          />
        </div>
      </div>

      {/* Confirmation Modals for Admin Actions */}

      {/* Close Auction Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Confirm Close Auction"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to close the auction for <strong>"{auction.title}"</strong> immediately?
          The current highest bidder will be determined as the winner.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsCloseModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={adminActionLoading}
            onClick={handleCloseAuction}
          >
            Confirm Close
          </Button>
        </div>
      </Modal>

      {/* Relist Auction Modal */}
      <Modal
        isOpen={isRelistModalOpen}
        onClose={() => setIsRelistModalOpen(false)}
        title="Relist Closed Auction"
      >
        <form onSubmit={handleRelistAuction} className="space-y-4">
          <p className="text-xs text-slate-500 mb-2">
            Set new start and end timestamps to reopen bidding on this item.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={relistStartTime}
              onChange={(e) => setRelistStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New End Time
            </label>
            <input
              type="datetime-local"
              required
              value={relistEndTime}
              onChange={(e) => setRelistEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsRelistModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={adminActionLoading}>
              Relist Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Auction Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Auction Listing"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to permanently delete <strong>"{auction.title}"</strong>?
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={adminActionLoading}
            onClick={handleDeleteAuction}
          >
            Delete Listing
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AuctionDetails;
