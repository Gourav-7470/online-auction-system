package com.univ.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.univ.entity.Auction;
import com.univ.entity.Watchlist;
import com.univ.exception.ResourceNotFoundException;
import com.univ.repository.AuctionRepository;
import com.univ.repository.WatchlistRepository;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    // Add auction to watchlist
    public Watchlist addToWatchlist(
            Long auctionId,
            String username) {

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Auction not found with id: " + auctionId));

        if (watchlistRepository
                .findByUsernameAndAuctionId(username, auctionId)
                .isPresent()) {

            throw new RuntimeException(
                    "Auction is already in your watchlist");
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUsername(username);
        watchlist.setAuction(auction);

        return watchlistRepository.save(watchlist);
    }

    // Get logged-in user's watchlist
    public List<Watchlist> getMyWatchlist(String username) {

        return watchlistRepository.findByUsername(username);
    }

    // Remove auction from watchlist
    public void removeFromWatchlist(
            Long auctionId,
            String username) {

        Watchlist watchlist = watchlistRepository
                .findByUsernameAndAuctionId(username, auctionId)
                .orElseThrow(() -> new RuntimeException(
                        "Auction is not in your watchlist"));

        watchlistRepository.delete(watchlist);
    }
}