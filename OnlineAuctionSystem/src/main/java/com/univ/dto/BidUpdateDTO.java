package com.univ.dto;

public class BidUpdateDTO {

    private Long auctionId;
    private String bidderUsername;
    private Double amount;

    public BidUpdateDTO() {
    }

    public BidUpdateDTO(
            Long auctionId,
            String bidderUsername,
            Double amount) {

        this.auctionId = auctionId;
        this.bidderUsername = bidderUsername;
        this.amount = amount;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getBidderUsername() {
        return bidderUsername;
    }

    public void setBidderUsername(String bidderUsername) {
        this.bidderUsername = bidderUsername;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}