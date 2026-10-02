package com.univ.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.AssertTrue;

@Entity
public class Auction {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "Title is required")
	private String title;
	
	@NotBlank(message = "Description is required")
	private String description;
	
	
	@NotNull(message = "Starting price is required")
	@Positive(message = "Starting price must be greater than 0")
	private Double startingPrice;
	
	
	@NotNull(message = "Current price is required")
	@Positive(message = "Current price must be greater than 0")
	private Double currentPrice;
	
	
	@NotNull(message = "Start time is required")
	private LocalDateTime startTime;
	
	
	@NotNull(message = "End time is required")
	private LocalDateTime endTime;
	
	
	@NotBlank(message = "Status is required")
	private String status;
	
	private String createdBy;
	
	private String winnerUsername;
	
	private Double winningAmount;

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

	public Auction() {
		super();
		// TODO Auto-generated constructor stub
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
	
	@AssertTrue(message = "End time must be after start time")
	public boolean isValidTimeRange() {
		
		if (startTime == null || endTime == null) {
			return true;
		}
		
		return endTime.isAfter(startTime);
	}
	
	

}
