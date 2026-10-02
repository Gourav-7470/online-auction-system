import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAuction from './pages/CreateAuction';
import MyAuctions from './pages/MyAuctions';
import MyBids from './pages/MyBids';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// 404 Component
function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-slate-900 mb-2">404</h1>
      <p className="text-lg font-bold text-slate-700 mb-2">Page Not Found</p>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Return to Home
      </a>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
              {/* Top Navigation */}
              <Navbar />

            {/* Main Application Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/auctions" element={<Auctions />} />
                <Route path="/auctions/:id" element={<AuctionDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-auction"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <CreateAuction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-auctions"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <MyAuctions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bids"
                  element={
                    <ProtectedRoute>
                      <MyBids />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Bottom Footer */}
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

export default App;
