package com.univ.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.univ.entity.Bid;

public interface BidRepository extends JpaRepository<Bid, Long> {

	List<Bid> findByAuctionIdOrderByAmountDesc(Long auctionId);
	
	List<Bid> findByBidderUsername(String bidderUsername);

	List<Bid> findByAuctionId(Long auctionId);
	
	List<Bid> findByBidderUsernameOrderByBidTimeDesc(String bidderUsername);
	
	List<Bid> findByAuctionIdOrderByBidTimeDesc(Long auctionId);

	Page<Bid> findByBidderUsername(String username, Pageable pageable);

	Page<Bid> findByAuctionId(Long auctionId, Pageable pageable);

}
