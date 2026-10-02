package com.univ.dto;

import java.time.LocalDateTime;

public class AuctionResponseDTO {
	
	private Long id;
	private String title;
	private String description;
	private Double startingPrice;
	private Double currentPrice;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private String status;
	private String createdBy;
	private String winnerUsername;
	private Double winningAmount;
	
	public AuctionResponseDTO() {
		
	}
	
	public AuctionResponseDTO( Long id, String title, String description, Double startingPrice, Double currentPrice, LocalDateTime startTime, LocalDateTime endTime, String status, String createdBy, String winnerUsername, Double winningAmount) {
		
		
		 this.id = id;
	        this.title = title;
	        this.description = description;
	        this.startingPrice = startingPrice;
	        this.currentPrice = currentPrice;
	        this.startTime = startTime;
	        this.endTime = endTime;
	        this.status = status;
	        this.createdBy = createdBy;
	        this.winnerUsername = winnerUsername;
	        this.winningAmount = winningAmount;
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Double getStartingPrice() {
		return startingPrice;
	}

	public void setStartingPrice(Double startingPrice) {
		this.startingPrice = startingPrice;
	}

	public Double getCurrentPrice() {
		return currentPrice;
	}

	public void setCurrentPrice(Double currentPrice) {
		this.currentPrice = currentPrice;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getWinnerUsername() {
		return winnerUsername;
	}

	public void setWinnerUsername(String winnerUsername) {
		this.winnerUsername = winnerUsername;
	}

	public Double getWinningAmount() {
		return winningAmount;
	}

	public void setWinningAmount(Double winningAmount) {
		this.winningAmount = winningAmount;
	}
	
}
	
	

