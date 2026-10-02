import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Gavel,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import watchlistApi from '../api/watchlistApi';
import AuctionCard from '../components/AuctionCard';
import { CardSkeleton } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { AUCTION_CATEGORIES } from '../utils/imageMapper';
import { useAuth } from '../hooks/useAuth';

export function Auctions() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state from URL
  const initialTitle = searchParams.get('title') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';

  const [searchTerm, setSearchTerm] = useState(initialTitle);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [auctions, setAuctions] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (newParams) => {
      const current = Object.fromEntries(searchParams.entries());
      const merged = { ...current, ...newParams };
      Object.keys(merged).forEach((k) => {
        if (!merged[k] || merged[k] === 'ALL' || merged[k] === 'All') {
          delete merged[k];
        }
      });
      setSearchParams(merged);
    },
    [searchParams, setSearchParams]
  );

  // Load Auctions
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine backend search/sort params
      let backendSortBy = 'id';
      let backendDir = 'desc';

      if (sortBy === 'endingSoon') {
        backendSortBy = 'endTime';
        backendDir = 'asc';
      } else if (sortBy === 'priceLow') {
        backendSortBy = 'currentPrice';
        backendDir = 'asc';
      } else if (sortBy === 'priceHigh') {
        backendSortBy = 'currentPrice';
        backendDir = 'desc';
      } else if (sortBy === 'newest') {
        backendSortBy = 'id';
        backendDir = 'desc';
      }

      const statusParam = selectedStatus === 'ALL' ? '' : selectedStatus;

      // Try paginated search endpoint first
      let pageData;
      try {
        pageData = await auctionApi.searchAuctions({
          title: searchTerm,
          status: statusParam,
          page,
          size: pageSize,
          sortBy: backendSortBy,
          direction: backendDir,
        });
      } catch (err) {
        // Fallback to getActive or getAll if search not permitted or fails
        const fallbackList = await auctionApi.getAllAuctions();
        pageData = {
          content: fallbackList,
          totalPages: 1,
          totalElements: fallbackList.length,
        };
      }

      let items = pageData.content || (Array.isArray(pageData) ? pageData : []);

      // Client-side category filtering
      if (selectedCategory && selectedCategory !== 'All') {
        const catKey = selectedCategory.split(' ')[0].toLowerCase();
        items = items.filter((a) => {
          const text = `${a.title || ''} ${a.description || ''}`.toLowerCase();
          return text.includes(catKey);
        });
      }

      // Client-side price filter
      if (minPrice) {
        items = items.filter((a) => (a.currentPrice || a.startingPrice || 0) >= Number(minPrice));
      }
      if (maxPrice) {
        items = items.filter((a) => (a.currentPrice || a.startingPrice || 0) <= Number(maxPrice));
      }

      setAuctions(items);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements ?? items.length);

      // Fetch user's watchlist if logged in
      if (isAuthenticated) {
        try {
          const wl = await watchlistApi.getMyWatchlist();
          if (Array.isArray(wl)) {
            setWatchlistIds(new Set(wl.map((w) => w.auction?.id || w.id)));
          }
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Fetch auctions error:', err);
      setError(err.userMessage || 'Failed to load auctions.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedCategory, sortBy, minPrice, maxPrice, page, pageSize, isAuthenticated]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    updateUrlParams({ title: searchTerm });
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPage(0);
    updateUrlParams({ status });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(0);
    updateUrlParams({ category });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    setPage(0);
    updateUrlParams({ sort: val });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedCategory('All');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'All' ||
    minPrice ||
    maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Auction Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore authentic items, inspect real-time highest bids, and place winning bids.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'ACTIVE', label: 'Live Now' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'CLOSED', label: 'Closed / Past' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sortBy" className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                className="pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="endingSoon">Ending Soon</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {AUCTION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/25'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage
            title="Unable to load auctions"
            message={error}
            onRetry={fetchAuctions}
          />
        ) : auctions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Gavel className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No matching auctions found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any auctions matching your current filter criteria. Try clearing some
              filters or searching for a different keyword.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                isWatchlisted={watchlistIds.has(auction.id)}
                onWatchlistToggle={(id, isSaved) => {
                  setWatchlistIds((prev) => {
                    const next = new Set(prev);
                    if (isSaved) next.add(id);
                    else next.delete(id);
                    return next;
                  });
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">{page + 1}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
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
    </div>
  );
}

export default Auctions;
