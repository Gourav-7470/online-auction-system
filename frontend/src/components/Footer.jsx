import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Shield, Lock, Clock, Heart, Award, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Footer() {
  const { isAdmin } = useAuth();
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Authenticity Guaranteed</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every auction item is vetted and backed by strict reserve price rules.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Encrypted & Secure</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                JWT token-based authorization and real-time STOMP WebSocket integrity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Live Real-Time Bids</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant millisecond bid updates with automatic closing timers.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Gavel className="w-4 h-4 text-gold-400" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Bid<span className="text-indigo-400">Zone</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Bid Smart. Win More. The premier real-time auction marketplace for luxury timepieces,
              electronics, fine art, and rare collectibles.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Spring Boot REST & WebSocket Connected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/auctions" className="hover:text-white transition-colors">
                  Explore All Auctions
                </Link>
              </li>
              <li>
                <Link to="/auctions?status=ACTIVE" className="hover:text-white transition-colors">
                  Live Active Bidding
                </Link>
              </li>
              <li>
                <Link to="/auctions?status=UPCOMING" className="hover:text-white transition-colors">
                  Upcoming Previews
                </Link>
              </li>
              <li>
                <Link to="/auctions?status=CLOSED" className="hover:text-white transition-colors">
                  Past Results & Winners
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Tools */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              {!isAdmin && (
                <li>
                  <Link to="/my-bids" className="hover:text-white transition-colors">
                    My Active Bids
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <Link to="/my-auctions" className="hover:text-white transition-colors">
                      My Listed Auctions
                    </Link>
                  </li>
                  <li>
                    <Link to="/create-auction" className="hover:text-white transition-colors">
                      Create New Auction
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="hover:text-white transition-colors text-amber-400">
                      Admin Console
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Watchlist & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About BidZone
                </Link>
              </li>
              <li>
                <span className="text-slate-400">REST API: Spring Boot 4 / Java 21</span>
              </li>
              <li>
                <span className="text-slate-400">Real-Time: STOMP over WebSocket</span>
              </li>
              <li>
                <span className="text-slate-400">Security: JWT + BCrypt Passwords</span>
              </li>
              <li>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Backend Swagger Docs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BidZone Online Auction System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Auction Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
