package com.univ.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.univ.entity.Auction;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByStatusIgnoreCase(String status);

    List<Auction> findByCreatedBy(String createdBy);
    

    List<Auction> findByTitleContainingIgnoreCase(String title);
    
    List<Auction> findByStatusIgnoreCaseAndEndTimeBefore(String status, LocalDateTime time);
    
    Page findAll(Pageable pageable);
    
    Page<Auction> findByTitleContainingIgnoreCase(
            String title,
            Pageable pageable);

    Page<Auction> findByStatusIgnoreCase(
            String status,
            Pageable pageable);

    Page<Auction> findByTitleContainingIgnoreCaseAndStatusIgnoreCase(
            String title,
            String status,
            Pageable pageable);
    List<Auction> findByWinnerUsername(String username);
}