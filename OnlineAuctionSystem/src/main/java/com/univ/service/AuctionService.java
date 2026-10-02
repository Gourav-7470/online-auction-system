package com.univ.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.univ.dto.AuctionResultDTO;
import com.univ.entity.Auction;
import com.univ.entity.Bid;
import com.univ.exception.ResourceNotFoundException;
import com.univ.repository.AuctionRepository;
import com.univ.repository.BidRepository;
import org.springframework.scheduling.annotation.Scheduled;
import com.univ.dto.AuctionResponseDTO;

@Service
public class AuctionService {

	@Autowired
	private BidRepository bidRepository;

	@Autowired
	private BidService bidService;
	
	@Autowired
	private AuctionRepository auctionRepository;
	
	@Autowired
	private NotificationService notificationService;

	// Create Auction
//	public Auction createAuction(Auction auction) {
//		if (auction.getCurrentPrice() == null) {
//			auction.setCurrentPrice(auction.getStartingPrice());
//		}
//		
//		if(auction.getStatus() == null || auction.getStatus().isBlank()) {
//			auction.setStatus("ACTIVE");
//		}
//		
//		return auctionRepository.save(auction);
//	}
	public Auction createAuction(Auction auction) {

		LocalDateTime now = LocalDateTime.now();

		// Current price starts from starting price
		if (auction.getCurrentPrice() == null) {
			auction.setCurrentPrice(auction.getStartingPrice());
		}

		// Automatically determine auction status
		if (auction.getStartTime() != null && now.isBefore(auction.getStartTime())) {

			auction.setStatus("UPCOMING");

		} else if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {

			auction.setStatus("CLOSED");

		} else {

			auction.setStatus("ACTIVE");
		}

		return auctionRepository.save(auction);
	}

	// Get all Auctions
	public List<Auction> getAllAuctions() {
		return auctionRepository.findAll();
	}

	// Get Auction by ID
	public Auction getAuctionById(Long id) {
		return auctionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
	}

	public AuctionResponseDTO getAuctionResponseById(Long id) {

		Auction auction = auctionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

		return convertToDTO(auction);

	}

	// Delete Auction
	public void deleteAuction(Long id) {
		auctionRepository.deleteById(id);
	}

	public Auction closeAuction(Long id) {

		Auction auction = auctionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

		// Already closed
		if ("CLOSED".equalsIgnoreCase(auction.getStatus())) {
			return auction;
		}

		// Find highest bid
		List<Bid> bids = bidRepository.findByAuctionIdOrderByAmountDesc(id);

		if (!bids.isEmpty()) {

		    Bid winningBid = bids.get(0);

		    auction.setWinnerUsername(
		            winningBid.getBidderUsername());

		    auction.setWinningAmount(
		            winningBid.getAmount());

		    notificationService.createNotification(
		            winningBid.getBidderUsername(),
		            "Congratulations! You won auction '"
		                    + auction.getTitle()
		                    + "' with a bid of ₹"
		                    + winningBid.getAmount(),
		            auction
		    );
		

		} else {

			auction.setWinnerUsername(null);
			auction.setWinningAmount(null);
		}

		// Close auction
		auction.setStatus("CLOSED");

		return auctionRepository.save(auction);
	}

	// Relist a closed and unsold auction
	public Auction relistAuction(Long id, LocalDateTime newStartTime, LocalDateTime newEndTime) {

		Auction auction = auctionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

		// Auction must be closed first
		if (!"CLOSED".equalsIgnoreCase(auction.getStatus())) {
			throw new RuntimeException("Only closed auctions can be relisted");
		}

		// Check whether any bids were placed
		List<Bid> bids = bidRepository.findByAuctionIdOrderByAmountDesc(id);

		if (!bids.isEmpty()) {
			throw new RuntimeException("Sold auction cannot be relisted");
		}

		// Validate new start and end time
		if (newStartTime == null || newEndTime == null) {
			throw new RuntimeException("New start time and end time are required");
		}

		if (!newEndTime.isAfter(newStartTime)) {
			throw new RuntimeException("End time must be after start time");
		}

		// Reset auction for new round
		auction.setStartTime(newStartTime);
		auction.setEndTime(newEndTime);

		// Reset price to original starting price
		auction.setCurrentPrice(auction.getStartingPrice());

		// Clear previous winner information
		auction.setWinnerUsername(null);
		auction.setWinningAmount(null);

		// Decide new status
		LocalDateTime now = LocalDateTime.now();

		if (now.isBefore(newStartTime)) {
			auction.setStatus("UPCOMING");
		} else if (!now.isBefore(newEndTime)) {
			auction.setStatus("CLOSED");
		} else {
			auction.setStatus("ACTIVE");
		}

		return auctionRepository.save(auction);
	}

	// Get Closed Auctions
	public List<Auction> getClosedAuctions() {
		return auctionRepository.findByStatusIgnoreCase("CLOSED");
	}

	// Get Auctions Created By User
	public List<Auction> getAuctionsByCreator(String username) {
		return auctionRepository.findByCreatedBy(username);
	}

	// Active actions
	public List<Auction> getActiveAuctions() {
		return auctionRepository.findByStatusIgnoreCase("ACTIVE");
	}

	// Search Auctions
	public List<Auction> searchAuctions(String title) {
		return auctionRepository.findByTitleContainingIgnoreCase(title);
	}

	@Scheduled(fixedRate = 60000)
	public void updateAuctionStatuses() {

		LocalDateTime now = LocalDateTime.now();

		List<Auction> auctions = auctionRepository.findAll();

		for (Auction auction : auctions) {

			// UPCOMING → ACTIVE
			if ("UPCOMING".equalsIgnoreCase(auction.getStatus()) && auction.getStartTime() != null
					&& !now.isBefore(auction.getStartTime())) {

				auction.setStatus("ACTIVE");
				auctionRepository.save(auction);

				System.out.println("Auction automatically activated: " + auction.getId());
			}

			// ACTIVE → CLOSED
			if ("ACTIVE".equalsIgnoreCase(auction.getStatus()) && auction.getEndTime() != null
					&& !now.isBefore(auction.getEndTime())) {

				closeAuction(auction.getId());

				System.out.println("Auction automatically closed: " + auction.getId());
			}
		}
	}

	// Get Closed Auction Results with Pagination
	public Page<AuctionResultDTO> getAuctionResults(Pageable pageable) {

		Page<Auction> auctions = auctionRepository.findAll(pageable);

		return auctions.map(auction -> {

			Bid winningBid = bidService.getWinningBid(auction.getId());

			String winnerUsername = null;
			Double winningAmount = null;

			if (winningBid != null) {
				winnerUsername = winningBid.getBidderUsername();
				winningAmount = winningBid.getAmount();
			}
			String result = winningBid != null ? "SOLD" : "UNSOLD";

			return new AuctionResultDTO(auction.getId(), auction.getTitle(), auction.getStatus(), winnerUsername,
					winningAmount, result);
		});
	}

	public Page<Auction> getAuctions(Pageable pageable) {

		return auctionRepository.findAll(pageable);
	}

	public Page<Auction> searchAuctions(String title, String status, Pageable pageable) {

		if (title != null && !title.isBlank() && status != null && !status.isBlank()) {

			return auctionRepository.findByTitleContainingIgnoreCaseAndStatusIgnoreCase(title, status, pageable);
		}

		if (title != null && !title.isBlank()) {

			return auctionRepository.findByTitleContainingIgnoreCase(title, pageable);
		}

		if (status != null && !status.isBlank()) {

			return auctionRepository.findByStatusIgnoreCase(status, pageable);
		}

		return auctionRepository.findAll(pageable);
	}

	public Auction updateAuction(Long id, Auction updatedAuction) {

		Auction existingAuction = auctionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

		// Closed auction ko normal update se change nahi karna
		if ("CLOSED".equalsIgnoreCase(existingAuction.getStatus())) {
			throw new RuntimeException("Closed auction cannot be updated. Use relist instead.");
		}

		// Title
		if (updatedAuction.getTitle() != null && !updatedAuction.getTitle().isBlank()) {
			existingAuction.setTitle(updatedAuction.getTitle());
		}

		// Description
		if (updatedAuction.getDescription() != null) {
			existingAuction.setDescription(updatedAuction.getDescription());
		}

		// Starting Price
		if (updatedAuction.getStartingPrice() != null) {

			if (updatedAuction.getStartingPrice() <= 0) {
				throw new RuntimeException("Starting price must be greater than 0");
			}

			existingAuction.setStartingPrice(updatedAuction.getStartingPrice());
		}

		// Start Time
		if (updatedAuction.getStartTime() != null) {
			existingAuction.setStartTime(updatedAuction.getStartTime());
		}

		// End Time
		if (updatedAuction.getEndTime() != null) {
			existingAuction.setEndTime(updatedAuction.getEndTime());
		}

		// Validate final time range
		if (existingAuction.getStartTime() != null && existingAuction.getEndTime() != null
				&& !existingAuction.getEndTime().isAfter(existingAuction.getStartTime())) {

			throw new RuntimeException("End time must be after start time");
		}

		// Status is controlled by system
		LocalDateTime now = LocalDateTime.now();

		if (existingAuction.getStartTime() != null && now.isBefore(existingAuction.getStartTime())) {

			existingAuction.setStatus("UPCOMING");

		} else if (existingAuction.getEndTime() != null && !now.isBefore(existingAuction.getEndTime())) {

			existingAuction.setStatus("CLOSED");

		} else {

			existingAuction.setStatus("ACTIVE");
		}

		return auctionRepository.save(existingAuction);
	}

	private AuctionResponseDTO convertToDTO(Auction auction) {

		return new AuctionResponseDTO(auction.getId(), auction.getTitle(), auction.getDescription(),
				auction.getStartingPrice(), auction.getCurrentPrice(), auction.getStartTime(), auction.getEndTime(),
				auction.getStatus(), auction.getCreatedBy(), auction.getWinnerUsername(), auction.getWinningAmount());
	}
}
