package com.univ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.univ.entity.Bid;
import com.univ.service.BidService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.univ.dto.BidHistoryDTO;

@RestController
@RequestMapping("/bid")
public class BidController {

    @Autowired
    private BidService bidService;


    // Place Bid
//    @PostMapping("/place/{auctionId}")
//    public Bid placeBid(
//            @PathVariable Long auctionId,
//            @RequestParam Double amount,
//            Authentication authentication) {
//
//        String username = authentication.getName();
//
//        return bidService.placeBid(
//                auctionId,
//                username,
//                amount
//        );
//    }
    //Place Bid
    @PostMapping("/place/{auctionId}")
    public Bid placeBid(
            @PathVariable Long auctionId,
            @RequestParam Double amount,
            Authentication authentication) {

        System.out.println("==============================");
        System.out.println("USERNAME = " + authentication.getName());
        System.out.println("AUTHORITIES = " + authentication.getAuthorities());
        System.out.println("AUCTION ID = " + auctionId);
        System.out.println("AMOUNT = " + amount);
        System.out.println("==============================");

        String username = authentication.getName();

        return bidService.placeBid(
                auctionId,
                username,
                amount
        );
    }


    // Get all bids
    @GetMapping("/all")
    public List<Bid> getAllBids() {
        return bidService.getAllBids();
    }


    // Get bids of particular auction
    @GetMapping("/auction/{auctionId}")
    public List<Bid> getBidsByAuction(
            @PathVariable Long auctionId) {

        return bidService.getBidsByAuction(auctionId);
    }


 // Get my bids with pagination
    @GetMapping("/my")
    public Page<BidHistoryDTO> getMyBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("bidTime").descending());

        return bidService.getMyBidHistory(
                authentication.getName(),
                pageable
        );
    }
    
    
 // Get auction bid history with pagination
    @GetMapping("/auction/{auctionId}/page")
    public Page<BidHistoryDTO> getAuctionBidHistory(
            @PathVariable Long auctionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);

        return bidService.getAuctionBidHistory(
                auctionId,
                pageable
        );
    }
}