import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Bookmark, ArrowRight, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { getAuctionImage } from '../utils/imageMapper';
import Badge from './Badge';
import CountdownTimer from './CountdownTimer';
import watchlistApi from '../api/watchlistApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function AuctionCard({
  auction,
  isWatchlisted: initialWatchlisted = false,
  onWatchlistToggle,
}) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialWatchlisted);
  const [isBookmarking, setIsBookmarking] = useState(false);

  if (!auction) return null;

  const imageUrl = getAuctionImage(auction);
  const currentPrice = auction.currentPrice ?? auction.startingPrice ?? 0;
  const startingPrice = auction.startingPrice ?? 0;
  const isHigherThanStart = currentPrice > startingPrice;

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('Please log in to add items to your watchlist');
      return;
    }

    try {
      setIsBookmarking(true);
      if (isBookmarked) {
        await watchlistApi.removeFromWatchlist(auction.id);
        setIsBookmarked(false);
        toast.info(`Removed "${auction.title}" from watchlist`);
      } else {
        await watchlistApi.addToWatchlist(auction.id);
        setIsBookmarked(true);
        toast.success(`Saved "${auction.title}" to watchlist`);
      }
      if (onWatchlistToggle) {
        onWatchlistToggle(auction.id, !isBookmarked);
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update watchlist');
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative auction-card-hover">
      {/* Image Header with Overlays */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <Badge status={auction.status} />
        </div>

        {/* Watchlist Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          disabled={isBookmarking}
          aria-label={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            isBookmarked
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'bg-slate-900/60 text-white hover:bg-white hover:text-slate-900'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Countdown pill inside image */}
        {auction.status?.toUpperCase() === 'ACTIVE' && (
          <div className="absolute bottom-3 left-3 z-10">
            <CountdownTimer endTime={auction.endTime} compact={true} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link to={`/auctions/${auction.id}`} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1 mb-1.5" title={auction.title}>
              {auction.title}
            </h3>
          </Link>

          {/* Description Preview */}
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {auction.description || 'Verified authentic auction item offered with reserve price guarantee.'}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-3">
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isHigherThanStart ? 'Current Bid' : 'Starting Price'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            {isHigherThanStart && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Start: {formatCurrency(startingPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/auctions/${auction.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-sm shadow-indigo-600/20 transition-all shrink-0"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuctionCard;
