package com.univ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.univ.entity.Watchlist;
import com.univ.service.WatchlistService;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @PostMapping("/add/{auctionId}")
    public Watchlist addToWatchlist(
            @PathVariable Long auctionId,
            Authentication authentication) {

        return watchlistService.addToWatchlist(
                auctionId,
                authentication.getName()
        );
    }

    @GetMapping("/my")
    public List<Watchlist> getMyWatchlist(
            Authentication authentication) {

        return watchlistService.getMyWatchlist(
                authentication.getName()
        );
    }

    @DeleteMapping("/remove/{auctionId}")
    public String removeFromWatchlist(
            @PathVariable Long auctionId,
            Authentication authentication) {

        watchlistService.removeFromWatchlist(
                auctionId,
                authentication.getName()
        );

        return "Auction removed from watchlist successfully";
    }
}

