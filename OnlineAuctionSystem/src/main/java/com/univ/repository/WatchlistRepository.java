package com.univ.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.univ.entity.Watchlist;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUsername(String username);

    Optional<Watchlist> findByUsernameAndAuctionId(
            String username,
            Long auctionId);

    void deleteByUsernameAndAuctionId(
            String username,
            Long auctionId);
}