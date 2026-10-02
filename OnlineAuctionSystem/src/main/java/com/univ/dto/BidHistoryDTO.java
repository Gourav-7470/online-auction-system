package com.univ.dto;

import java.time.LocalDateTime;

public class BidHistoryDTO {

    private Long bidId;
    private Double amount;
    private LocalDateTime bidTime;
    private String bidderUsername;
    private Long auctionId;
    private String auctionTitle;

    public BidHistoryDTO() {
    }

    public BidHistoryDTO(Long bidId, Double amount, LocalDateTime bidTime,
                         String bidderUsername, Long auctionId, String auctionTitle) {
        this.bidId = bidId;
        this.amount = amount;
        this.bidTime = bidTime;
        this.bidderUsername = bidderUsername;
        this.auctionId = auctionId;
        this.auctionTitle = auctionTitle;
    }

    public Long getBidId() {
        return bidId;
    }

    public void setBidId(Long bidId) {
        this.bidId = bidId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getBidTime() {
        return bidTime;
    }

    public void setBidTime(LocalDateTime bidTime) {
        this.bidTime = bidTime;
    }

    public String getBidderUsername() {
        return bidderUsername;
    }

    public void setBidderUsername(String bidderUsername) {
        this.bidderUsername = bidderUsername;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getAuctionTitle() {
        return auctionTitle;
    }

    public void setAuctionTitle(String auctionTitle) {
        this.auctionTitle = auctionTitle;
    }
}