import React from 'react';
import { Shield, Award, Users, Gavel, CheckCircle2, Lock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
          About BidZone
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Redefining Real-Time Online Auctions
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          BidZone was engineered from the ground up to bring transparency, sub-second latency,
          and rock-solid security to the online auction industry.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Zero-Latency Bidding</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Powered by high-throughput Spring Boot WebSocket STOMP messaging, bids are propagated
            instantly to every active watcher without requiring page refreshes.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Fair Play & Security</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every transaction is verified using cryptographically signed JWT tokens and server-enforced
            bid increments, eliminating sniping bots and duplicate bids.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Curated Authenticity</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            From rare horology to vintage collectibles and flagship tech, listings adhere to strict
            item condition disclosures and starting reserve benchmarks.
          </p>
        </div>
      </div>

      {/* Technical Architecture Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block mb-2">
            Engineering Excellence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Full-Stack Modern Architecture
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            BidZone is built with a decoupled enterprise frontend and Java Spring Boot backend:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Frontend Stack
              </h4>
              <p className="text-slate-400">
                React 18, Vite, Tailwind CSS, React Router DOM, Axios, STOMPjs WebSocket client, and Lucide icons.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Backend Stack
              </h4>
              <p className="text-slate-400">
                Java 21, Spring Boot 4, Spring Security, JWT, Spring Data JPA / Hibernate, MySQL, and Spring WebSocket.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to experience the thrill?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Create a free account or explore live bidding right now.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/auctions">
            <Button size="lg" icon={Gavel}>
              Browse Auctions
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
