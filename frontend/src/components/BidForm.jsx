import React, { useState } from 'react';
import { Gavel, AlertCircle, ArrowUpRight, LogIn, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import Button from './Button';
import bidApi from '../api/bidApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function BidForm({
  auction,
  onBidSuccess,
  className = '',
}) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const toast = useToast();

  const currentPrice = auction?.currentPrice ?? auction?.startingPrice ?? 0;
  const minValidBid = currentPrice + 1;

  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const isActive = auction?.status?.toUpperCase() === 'ACTIVE';

  const quickIncrements = [100, 500, 1000, 5000];

  const handleIncrement = (amount) => {
    const base = Number(bidAmount) > currentPrice ? Number(bidAmount) : currentPrice;
    setBidAmount(String(base + amount));
    setFormError('');
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isAuthenticated) {
      setFormError('You must be logged in to place a bid.');
      return;
    }

    if (isAdmin) {
      setFormError('Administrators cannot place bids. Bidding is restricted to buyer accounts.');
      return;
    }

    if (!isActive) {
      setFormError('This auction is not active. Bids can only be placed on active auctions.');
      return;
    }

    const numericBid = parseFloat(bidAmount);

    if (isNaN(numericBid) || numericBid <= 0) {
      setFormError('Please enter a valid positive bid amount.');
      return;
    }

    if (numericBid <= currentPrice) {
      setFormError(
        `Your bid must be strictly greater than the current price of ${formatCurrency(
          currentPrice
        )}. Minimum valid bid is ${formatCurrency(minValidBid)}.`
      );
      return;
    }

    try {
      setLoading(true);
      // Place bid through backend REST API
      const newBid = await bidApi.placeBid(auction.id, numericBid);

      toast.success(
        `Bid placed successfully! You are now the highest bidder at ${formatCurrency(
          numericBid
        )}.`
      );

      setBidAmount('');
      if (onBidSuccess) {
        onBidSuccess(newBid, numericBid);
      }
    } catch (err) {
      console.error('Bid placement error:', err);
      const msg = err.userMessage || 'Failed to place bid. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Place Your Bid</h3>
            <p className="text-xs text-slate-500">Live competitive auction</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
            Current Price
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight">
            {formatCurrency(currentPrice)}
          </span>
        </div>
      </div>

      {isAdmin ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-amber-900 mb-1">
            Admin Account (Bidding Disabled)
          </p>
          <p className="text-xs text-amber-700 max-w-xs mx-auto">
            Administrators manage listings and cannot place bids. Bidding is exclusively reserved for buyer accounts.
          </p>
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-5 text-center">
          <p className="text-sm font-medium text-slate-700 mb-3">
            You must be logged in to participate in this auction.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Login to Place Bid</span>
          </Link>
        </div>
      ) : !isActive ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-sm font-medium text-amber-900">
            {auction?.status === 'CLOSED'
              ? 'This auction is officially closed. No more bids are accepted.'
              : 'This auction has not started yet.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleBidSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bidAmount"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Enter Your Bid Amount (₹)
            </label>
            <div className="relative rounded-xl shadow-sm">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 text-base pointer-events-none">
                ₹
              </span>
              <input
                id="bidAmount"
                type="number"
                step="any"
                min={minValidBid}
                placeholder={`e.g. ${minValidBid}`}
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(e.target.value);
                  setFormError('');
                }}
                disabled={loading}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-lg font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              Minimum acceptable next bid:{' '}
              <span className="font-semibold text-slate-700">
                {formatCurrency(minValidBid)}
              </span>
            </p>
          </div>

          {/* Quick Increment Buttons */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Bid Increments
            </span>
            <div className="grid grid-cols-4 gap-2">
              {quickIncrements.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleIncrement(inc)}
                  disabled={loading}
                  className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  +{formatCurrency(inc)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={loading || !bidAmount}
            className="w-full font-bold shadow-lg shadow-indigo-600/20"
            icon={ArrowUpRight}
            iconPosition="right"
          >
            Confirm & Place Bid
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            By placing a bid, you agree to commit to purchase if you are the winning bidder.
          </p>
        </form>
      )}
    </div>
  );
}

export default BidForm;
