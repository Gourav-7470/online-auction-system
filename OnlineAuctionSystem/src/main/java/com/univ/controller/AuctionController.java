package com.univ.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import com.univ.dto.AuctionResponseDTO;
import com.univ.dto.AuctionResultDTO;
import com.univ.entity.Auction;
import com.univ.entity.Bid;
import com.univ.service.AuctionService;
import com.univ.service.BidService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;



@RestController
@RequestMapping("/auction")
@SecurityRequirement(name = "bearerAuth")
public class AuctionController {

	@Autowired
	private AuctionService auctionService;
	
	@Autowired
	private BidService bidService;
	
	
	//Create Auction
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/create")
	public Auction createAuction(@Valid @RequestBody Auction auction, Authentication authentication) {
		auction.setCreatedBy(authentication.getName());
		return auctionService.createAuction(auction);
	}
	
	//Get All Auctions
	@GetMapping("/all")
	public List<Auction> getAllAuction(){
		return auctionService.getAllAuctions();
	}
	
	//Get Auction By ID
//	@GetMapping("/{id}")
//	public Auction getAuctionById(@PathVariable Long id) {
//		return auctionService.getAuctionById(id);
//	}
//	
	
	
	@GetMapping("/{id}")
	public AuctionResponseDTO getAuctionById(@PathVariable Long id) {
	    return auctionService.getAuctionResponseById(id);
	}
	
	//Delete Auction
	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteAuction(@PathVariable Long id) {
		Auction auction = auctionService.getAuctionById(id);
		
		if(auction == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Auction not found");
		}
		auctionService.deleteAuction(id);
		
		return ResponseEntity.ok("Auction deleted succesfully");
	}
	
	//Close Auction
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/close/{id}")
	public Auction closeAuction(@PathVariable Long id) {

	    return auctionService.closeAuction(id);
	}
	
	
	// Relist closed and unsold auction
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/relist/{id}")
	public Auction relistAuction(
	        @PathVariable Long id,
	        @RequestParam LocalDateTime startTime,
	        @RequestParam LocalDateTime endTime) {

	    return auctionService.relistAuction(
	            id,
	            startTime,
	            endTime
	    );
	}
	
	// Get Auction Winner
	@GetMapping("/{id}/winner")
	public String getWinner(@PathVariable Long id) {

	    Bid winningBid = bidService.getWinningBid(id);

	    if (winningBid == null) {
	        return "No bids placed on this auction";
	    }

	    return "Winner: " + winningBid.getBidderUsername()
	            + " | Winning Bid: " + winningBid.getAmount();
	}
	
	// Get Closed Auctions
	@GetMapping("/closed")
	public List<Auction> getClosedAuctions() {
	    return auctionService.getClosedAuctions();
	}


	// Get Auctions Created By Logged-in User
	@GetMapping("/my")
	public List<Auction> getMyAuctions(Authentication authentication) {

	    return auctionService.getAuctionsByCreator(
	            authentication.getName()
	    );
	}
	
	
	//Result
	@GetMapping("/{id}/result")
	public AuctionResultDTO getAuctionResult(@PathVariable Long id) {
		
		Auction auction = auctionService.getAuctionById(id);
		
		if(auction == null){
			throw new RuntimeException("Auction not found");
		}
		
		String result = auction.getWinnerUsername() != null
		        ? "SOLD"
		        : "UNSOLD";

		return new AuctionResultDTO(
		        auction.getId(),
		        auction.getTitle(),
		        auction.getStatus(),
		        auction.getWinnerUsername(),
		        auction.getWinningAmount(),
		        result
		);
	}
	@GetMapping("/active")
	public List<Auction> getActiveAuction(){
		return auctionService.getActiveAuctions();
	}
	
	
	@GetMapping("/page")
	public Page<Auction> getActions(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size){
		
		Pageable pageable = PageRequest.of(page, size);
		
		return auctionService.getAuctions(pageable);
	}
	
	// Get Auction Results with Pagination
	@GetMapping("/result")
	public Page<AuctionResultDTO> getAuctionResults(
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "5") int size) {

	    Pageable pageable = PageRequest.of(page, size);

	    return auctionService.getAuctionResults(pageable);
	}
	
	@GetMapping("/search")
	public Page<Auction> searchAuctions(

	        @RequestParam(required = false) String title,

	        @RequestParam(required = false) String status,

	        @RequestParam(defaultValue = "0") int page,

	        @RequestParam(defaultValue = "5") int size,

	        @RequestParam(defaultValue = "id") String sortBy,

	        @RequestParam(defaultValue = "asc") String direction) {

	    Sort sort;

	    if ("desc".equalsIgnoreCase(direction)) {
	        sort = Sort.by(sortBy).descending();
	    } else {
	        sort = Sort.by(sortBy).ascending();
	    }

	    Pageable pageable =
	            PageRequest.of(page, size, sort);

	    return auctionService.searchAuctions(
	            title,
	            status,
	            pageable
	    );
	}
	
	
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{id}")
	public Auction updateAuction(
	        @PathVariable Long id,
	        @RequestBody Auction auction) {

	    return auctionService.updateAuction(id, auction);
	}
	
	
}
