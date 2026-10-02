import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Award,
  Users,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import watchlistApi from '../api/watchlistApi';
import AuctionCard from '../components/AuctionCard';
import { CardSkeleton } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active auctions from backend
        let auctions = [];
        try {
          auctions = await auctionApi.getActiveAuctions();
        } catch {
          // If active returns empty or error, try all
          auctions = await auctionApi.getAllAuctions();
        }

        if (isMounted) {
          setActiveAuctions(Array.isArray(auctions) ? auctions : []);
        }

        // If logged in, fetch user's watchlist to highlight bookmarks
        if (isAuthenticated) {
          try {
            const watchlist = await watchlistApi.getMyWatchlist();
            if (isMounted && Array.isArray(watchlist)) {
              setWatchlistIds(new Set(watchlist.map((w) => w.auction?.id || w.id)));
            }
          } catch {
            // Ignore watchlist failure
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Home auctions load error:', err);
          setError(err.userMessage || 'Failed to connect to auction backend.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Featured: first 3
  const featured = activeAuctions.slice(0, 3);

  // Ending Soon: sorted by endTime ascending
  const endingSoon = [...activeAuctions]
    .filter((a) => a.endTime && new Date(a.endTime).getTime() > Date.now())
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    .slice(0, 3);

  // Recently Added: sorted by id or startTime desc
  const recentlyAdded = [...activeAuctions]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white rounded-b-[2.5rem] shadow-2xl">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Next-Gen Real-Time Auction Experience</span>
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Bid Smart.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-100 to-amber-300">
              Win More.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover authenticated luxury timepieces, exclusive electronics, rare art, and collectibles.
            Place bids in real-time with zero latency WebSocket updates.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/auctions" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={Gavel}
                className="w-full sm:w-auto px-8 py-4 font-bold shadow-lg shadow-indigo-600/30 text-base"
              >
                Explore Auctions
              </Button>
            </Link>
            {isAdmin ? (
              <Link to="/create-auction" className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  icon={PlusCircle}
                  className="w-full sm:w-auto px-8 py-4 font-bold shadow-lg shadow-amber-500/20 text-base"
                >
                  Create Auction
                </Button>
              </Link>
            ) : (
              <Link to="/about" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto px-8 py-4 font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-base"
                >
                  How It Works
                </Button>
              </Link>
            )}
          </div>

          {/* Live Trust Metrics */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">₹1.8 Cr+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Volume Transacted
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.8%</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Seller Satisfaction
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Verified Bids
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 50ms</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                WebSocket Latency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Handpicked Premium Items</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Auctions
            </h2>
          </div>
          <Link
            to="/auctions"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
          >
            <span>Browse All Auctions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorMessage
            title="Unable to load live auctions"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active auctions at the moment</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Check back soon for new authenticated luxury listings.
            </p>
            {isAdmin ? (
              <Link to="/create-auction">
                <Button size="sm" icon={PlusCircle}>
                  Create an Auction
                </Button>
              </Link>
            ) : (
              <Link to="/auctions">
                <Button size="sm">Browse Marketplace</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                isWatchlisted={watchlistIds.has(auction.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Ending Soon Section */}
      {endingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Last Chance to Bid</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ending Soon
              </h2>
            </div>
            <Link
              to="/auctions?status=ACTIVE"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
            >
              <span>View All Ending Soon</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endingSoon.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                isWatchlisted={watchlistIds.has(auction.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="bg-slate-100/80 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How BidZone Works
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Participating in high-stakes live auctions has never been easier or more reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Discover Curated Items</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Explore a handpicked catalog of luxury watches, cutting-edge electronics, and fine collectibles
                with full transparent history and starting reserve.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Bid in Real-Time</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enter your bid and watch the live updates stream instantaneously over WebSockets.
                Get immediate alerts if you are outbid so you never miss a win.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Win & Collect Securely</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                When the countdown clock expires, the highest bidder is automatically declared the winner
                and notified with clear purchase fulfillment details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Freshly Listed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recently Added
              </h2>
            </div>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyAdded.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                isWatchlisted={watchlistIds.has(auction.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Platform CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
              {isAdmin ? 'Auction Administration' : 'Live Real-Time Auctions'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {isAdmin
                ? 'Ready to list a new authentic item?'
                : 'Ready to place your winning bids?'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              {isAdmin
                ? 'Create verified auction listings, set reserve prices, and monitor real-time competitive bidding from collectors platform-wide.'
                : 'Join thousands of collectors competing for rare timepieces, electronics, and art with sub-second real-time bidding.'}
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-indigo-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {isAdmin ? 'Instant Listing Creation' : 'Sub-50ms WebSocket Bids'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {isAdmin ? 'Admin Console Controls' : 'Reserve Price Protection'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {isAdmin ? 'Automated Winner Determination' : 'Authenticity Guaranteed'}
              </span>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            {isAdmin ? (
              <Link to="/create-auction">
                <Button
                  variant="gold"
                  size="lg"
                  icon={PlusCircle}
                  className="px-8 py-4 font-bold text-base shadow-xl shadow-amber-500/20"
                >
                  Create an Auction Now
                </Button>
              </Link>
            ) : (
              <Link to="/auctions">
                <Button
                  variant="gold"
                  size="lg"
                  icon={Gavel}
                  className="px-8 py-4 font-bold text-base shadow-xl shadow-amber-500/20"
                >
                  Explore All Auctions
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
