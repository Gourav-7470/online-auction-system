package com.univ.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.univ.entity.Auction;
import com.univ.entity.Bid;
import com.univ.repository.AuctionRepository;
import com.univ.repository.BidRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.univ.dto.BidHistoryDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    // Create Bid
    public Bid placeBid(Long auctionId, String bidderUsername, Double amount) {

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Auction active check
        if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            throw new RuntimeException("Auction is not active");
        }
        
     // Auction start/end time check
        LocalDateTime now = LocalDateTime.now();

        if (auction.getStartTime() != null &&
                now.isBefore(auction.getStartTime())) {

            throw new RuntimeException("Auction has not started yet");
        }

        if (auction.getEndTime() != null &&
                now.isAfter(auction.getEndTime())) {

            throw new RuntimeException("Auction has already ended");
        }

     // Bid amount validation
        if (amount == null || amount <= 0) {
            throw new RuntimeException("Bid amount must be greater than 0");
        }

        // Bid amount must be greater than current price
        if (amount <= auction.getCurrentPrice()) {
            throw new RuntimeException(
                    "Bid amount must be greater than current price: "
                    + auction.getCurrentPrice()
            );
        }

        // Create Bid
        Bid bid = new Bid();

        bid.setAmount(amount);
        bid.setBidderUsername(bidderUsername);
        bid.setAuction(auction);
        bid.setBidTime(LocalDateTime.now());

        
     // Update auction current price
     auction.setCurrentPrice(amount);

     auctionRepository.save(auction);

     // Save bid
     Bid savedBid = bidRepository.save(bid);

  // Send real-time bid update
     messagingTemplate.convertAndSend(
             "/topic/auction/" + auctionId,
             savedBid
     );

     return savedBid;

    }


    // Get all bids
    public List<Bid> getAllBids() {
        return bidRepository.findAll();
    }


    // Get bids of particular auction
    public List<Bid> getBidsByAuction(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidTimeDesc(auctionId);
    }


    // Get bids by user
    public List<Bid> getBidsByUser(String username) {
        return bidRepository.findByBidderUsernameOrderByBidTimeDesc(username);
    }


    // Get Winner Bid
    public Bid getWinningBid(Long auctionId) {

        List<Bid> bids =
                bidRepository.findByAuctionIdOrderByAmountDesc(auctionId);

        if (bids.isEmpty()) {
            return null;
        }

        return bids.get(0);
    }
    
    
 // Paginated bid history of logged-in user
    public Page<BidHistoryDTO> getMyBidHistory(
            String username,
            Pageable pageable) {

        Page<Bid> bids =
                bidRepository.findByBidderUsername(username, pageable);

        return bids.map(bid -> {

            Auction auction = bid.getAuction();

            return new BidHistoryDTO(
                    bid.getId(),
                    bid.getAmount(),
                    bid.getBidTime(),
                    bid.getBidderUsername(),
                    auction.getId(),
                    auction.getTitle()
            );
        });
    }


    // Paginated bids of particular auction
    public Page<BidHistoryDTO> getAuctionBidHistory(
            Long auctionId,
            Pageable pageable) {

        Page<Bid> bids =
                bidRepository.findByAuctionId(auctionId, pageable);

        return bids.map(bid -> {

            Auction auction = bid.getAuction();

            return new BidHistoryDTO(
                    bid.getId(),
                    bid.getAmount(),
                    bid.getBidTime(),
                    bid.getBidderUsername(),
                    auction.getId(),
                    auction.getTitle()
            );
        });
    }
}