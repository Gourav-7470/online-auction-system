package com.univ.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.univ.dto.DashboardDTO;
import com.univ.entity.Auction;
import com.univ.entity.Bid;
import com.univ.entity.Watchlist;
import com.univ.entity.Notification;
import com.univ.repository.AuctionRepository;
import com.univ.repository.BidRepository;
import com.univ.repository.WatchlistRepository;
import com.univ.repository.NotificationRepository;

@Service
public class DashboardService {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private NotificationRepository notificationRepository;


    public DashboardDTO getUserDashboard(String username) {

        // ==============================
        // 1. MY AUCTIONS
        // ==============================

        List<Auction> myAuctions =
                auctionRepository.findByCreatedBy(username);


        int totalAuctions = myAuctions.size();


        int activeAuctions = (int) myAuctions.stream()
                .filter(a ->
                        "ACTIVE".equalsIgnoreCase(a.getStatus()))
                .count();


        int closedAuctions = (int) myAuctions.stream()
                .filter(a ->
                        "CLOSED".equalsIgnoreCase(a.getStatus()))
                .count();


        // ==============================
        // 2. MY BIDS
        // ==============================

        List<Bid> myBids =
                bidRepository
                .findByBidderUsernameOrderByBidTimeDesc(username);


        int totalBids = myBids.size();


        // ==============================
        // 3. WATCHLIST
        // ==============================

        int watchlistCount =
                watchlistRepository
                .findByUsername(username)
                .size();


        // ==============================
        // 4. NOTIFICATIONS
        // ==============================

        List<Notification> notifications =
                notificationRepository
                .findByUsernameOrderByCreatedAtDesc(username);


        int unreadNotifications = (int) notifications.stream()
                .filter(notification ->
                        !notification.isRead())
                .count();


        // ==============================
        // 5. WON AUCTIONS
        // ==============================

        List<Auction> wonAuctions =
                auctionRepository
                .findByWinnerUsername(username);


        int wonAuctionsCount =
                wonAuctions.size();


        // ==============================
        // 6. TOTAL WINNING AMOUNT
        // ==============================

        double totalWinningAmount =
                wonAuctions.stream()
                .filter(a -> a.getWinningAmount() != null)
                .mapToDouble(Auction::getWinningAmount)
                .sum();


        // ==============================
        // RETURN DASHBOARD
        // ==============================

        return new DashboardDTO(

                username,

                totalAuctions,

                activeAuctions,

                closedAuctions,

                totalBids,

                watchlistCount,

                unreadNotifications,

                wonAuctionsCount,

                totalWinningAmount
        );
    }
}