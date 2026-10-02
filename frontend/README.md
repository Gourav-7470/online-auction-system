# BidZone - Online Auction System Frontend

A complete, modern, responsive frontend for the Online Auction System built with **React**, **Vite**, **Tailwind CSS**, **React Router DOM**, **Axios**, and **STOMP WebSocket**.

Communicates directly with the Spring Boot backend (`http://localhost:8080`).

---

## 🚀 Features

- **Real-Time Bidding**: Powered by STOMP over WebSocket (`/ws` and `/topic/auction/{id}`). Instant bid updates without page refreshes.
- **JWT Authentication**: Secure token storage in `localStorage` + `AuthContext`, automatic bearer token injection with Axios interceptors, 401 handling, and role detection (`USER` vs `ADMIN`).
- **Auction Marketplace**: Full catalog search, category filtering, live status tabs (Active, Upcoming, Closed), price sorting, and Spring Data pagination.
- **Auction Details & Live Feed**: High-res imagery, live countdown timers, min-bid validation, quick increment buttons (+₹100, +₹500, +₹1,000, +₹5,000), anonymized bid history, and closed winner announcements.
- **Seller & Admin Controls**: Create auction listings, close auctions, relist closed auctions, delete auctions, and audit all system bids.
- **User Dashboard**: Real backend stats from `/dashboard/my` (total auctions, active auctions, total bids, won auctions, total winning amount).
- **Watchlist & Notifications**: Bookmark auctions (`/watchlist`) and real-time notification center (`/notification/my`).
- **Toast Notifications & Modals**: Contextual notifications for successes, errors, and live incoming bids.

---

## 📁 Project Structure

```
frontend/
├── .env                       # Environment configuration (VITE_API_BASE_URL)
├── .env.example               # Template for environment variables
├── package.json               # Dependencies and build scripts
├── vite.config.js             # Vite configuration with proxy and STOMP global define
├── tailwind.config.js         # Tailwind CSS design system tokens
├── index.html                 # HTML shell with Google Fonts & metadata
└── src/
    ├── api/
    │   ├── axios.js           # Centralized Axios instance with JWT interceptors
    │   ├── authApi.js         # /login, /register, /test
    │   ├── auctionApi.js      # /auction/* (all, active, closed, search, create, close, relist, delete)
    │   ├── bidApi.js          # /bid/* (place, all, auction/{id}, my)
    │   ├── dashboardApi.js    # /dashboard/my
    │   ├── notificationApi.js # /notification/* (my, unread, read, read-all)
    │   ├── watchlistApi.js    # /watchlist/* (my, add, remove)
    │   └── userApi.js         # /user/* & /admin/*
    │
    ├── components/
    │   ├── Navbar.jsx         # Responsive navbar with notifications & mobile menu
    │   ├── Footer.jsx         # Footer with trust badges and marketplace links
    │   ├── AuctionCard.jsx    # Product card with countdown pill and watchlist bookmark
    │   ├── BidForm.jsx        # Prominent bidding section with validation & quick buttons
    │   ├── BidHistory.jsx     # Live bid list with highest bid badge and timestamps
    │   ├── CountdownTimer.jsx # Live ticking timer with onExpire status update
    │   ├── Badge.jsx          # Status pills (Active, Upcoming, Closed, Roles)
    │   ├── Button.jsx         # Styled button with variants and loading spinners
    │   ├── Input.jsx          # Accessible input with password toggle & validation error
    │   ├── Loading.jsx        # Spinner and skeleton loaders for cards/tables
    │   ├── ErrorMessage.jsx   # Error alert with retry button
    │   ├── Modal.jsx          # Dialog modal for action confirmations
    │   └── ProtectedRoute.jsx # Route guard for authenticated & admin-only routes
    │
    ├── pages/
    │   ├── Home.jsx           # Landing page: Hero, statistics, featured, ending soon, how it works
    │   ├── About.jsx          # Platform story, architecture, security
    │   ├── Auctions.jsx       # Auction catalog with search, category pills, filters, pagination
    │   ├── AuctionDetails.jsx # Detailed page with live WebSocket stream and bid history
    │   ├── CreateAuction.jsx  # Create listing form with live card preview
    │   ├── MyAuctions.jsx     # Seller's listed auctions with close/relist/delete actions
    │   ├── MyBids.jsx         # User's bidding history and status
    │   ├── Dashboard.jsx      # Metrics overview from /dashboard/my
    │   ├── Profile.jsx        # Account details, notifications center, watchlist manager
    │   └── AdminDashboard.jsx # Admin console: system KPIs, auction manager, bid audit log
    │
    ├── context/
    │   ├── AuthContext.jsx    # Auth state, login, register, logout, JWT decoder
    │   └── ToastContext.jsx   # Interactive toast notifications & live bid alerts
    │
    ├── hooks/
    │   ├── useAuth.js         # Hook for authentication state
    │   ├── useToast.js        # Hook for triggering toast notifications
    │   └── useAuctionWebSocket.js # STOMP WebSocket hook for /topic/auction/{id}
    │
    ├── utils/
    │   ├── auth.js            # JWT decoding, token validation, localStorage
    │   ├── formatters.js      # INR currency (₹), date formatters, relative time
    │   └── imageMapper.js     # Curated high-resolution photography mapper
    │
    ├── App.jsx                # Router and layout shell
    ├── main.jsx               # React DOM entry point
    └── index.css              # Tailwind CSS directives and custom utilities
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment (`.env`)

The `.env` file is located at `frontend/.env`:

```env
# Backend Spring Boot API Base URL
VITE_API_BASE_URL=http://localhost:8080

# Backend STOMP WebSocket URL
VITE_WS_URL=http://localhost:8080/ws
```

### 3. Run Locally (Development)

```bash
npm run dev
```

The frontend will run at: **http://localhost:5173**

### 4. Build for Production

```bash
npm run build
```

Production bundle will be compiled into the `dist/` directory.

---

## 🔗 Connecting to Spring Boot Backend

1. Start your Spring Boot backend on **port 8080**:
   ```bash
   cd ../OnlineAuctionSystem
   mvn spring-boot:run
   ```
2. Verify that MySQL is running and the database is configured in `application.properties`.
3. If running frontend and backend directly without proxy, ensure Spring Boot permits CORS from `http://localhost:5173`. For example, in `SecurityConfig.java`:
   ```java
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration config = new CorsConfiguration();
       config.setAllowedOrigins(List.of("http://localhost:5173"));
       config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
       config.setAllowedHeaders(List.of("*"));
       config.setAllowCredentials(true);
       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/**", config);
       return source;
   }
   ```
   And enable it in your `securityFilterChain`:
   ```java
   http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
   ```
