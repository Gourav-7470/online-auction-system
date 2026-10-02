import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Gavel,
  Menu,
  X,
  Bell,
  User,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import notificationApi from '../api/notificationApi';
import ThemeToggle from './ThemeToggle';

export function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notifications if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const unread = await notificationApi.getUnreadNotifications();
        if (isMounted && Array.isArray(unread)) {
          setUnreadCount(unread.length);
        }
      } catch {
        // Silent fail for notification check
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel dark:glass-dark border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5 text-gold-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                Bid<span className="text-indigo-600 dark:text-indigo-400">Zone</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase -mt-1">
                Live Auctions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/auctions" className={navLinkClass}>
              Auctions
            </NavLink>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <NavLink to="/my-auctions" className={navLinkClass}>
                    My Auctions
                  </NavLink>
                )}
                {!isAdmin && (
                  <NavLink to="/my-bids" className={navLinkClass}>
                    My Bids
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Admin
                    </span>
                  </NavLink>
                )}
              </>
            )}
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode / Light Mode Switch Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Create Auction button - Only for ADMIN */}
                {isAdmin && (
                  <Link
                    to="/create-auction"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Auction</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <Link
                  to="/profile#notifications"
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase">
                      {user?.username?.substring(0, 2) || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                      {user?.username || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-slide-up">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user?.username}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase">
                          Role: {user?.role || 'USER'}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/my-auctions"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            My Auctions
                          </Link>
                        )}
                        {!isAdmin && (
                          <Link
                            to="/my-bids"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            My Bids
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Profile & Watchlist
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      {/* Theme switcher toggle row in dropdown */}
                      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                        <ThemeToggle variant="switch" showLabel={true} className="w-full justify-between" />
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions & Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick Dark Mode toggle on mobile top bar */}
            <ThemeToggle />

            {isAuthenticated && (
              <Link
                to="/profile"
                className="relative p-1.5 text-slate-600 dark:text-slate-300"
                aria-label="Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase">
                  {user?.username?.substring(0, 2) || 'U'}
                </div>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 animate-slide-up">
          {/* Mobile Theme Toggle Card */}
          <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <ThemeToggle variant="full" />
          </div>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/auctions"
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`
            }
          >
            All Auctions
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`
            }
          >
            About
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {isAdmin && (
                  <NavLink
                    to="/create-auction"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Create Auction
                  </NavLink>
                )}
                <NavLink
                  to="/dashboard"
                  className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200"
                >
                  Dashboard
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/my-auctions"
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200"
                  >
                    My Auctions
                  </NavLink>
                )}
                {!isAdmin && (
                  <NavLink
                    to="/my-bids"
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200"
                  >
                    My Bids
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200"
                >
                  Profile & Notifications
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
                  >
                    Admin Console
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold text-rose-600 dark:text-rose-400"
                >
                  Logout ({user?.username})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-sm shadow-indigo-600/20"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;

