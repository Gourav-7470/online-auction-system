package com.univ.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bids")
public class Bid {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private Double amount;
	
	private LocalDateTime bidTime;
	
	private String bidderUsername;
	
	@ManyToOne
	@JoinColumn(name = "auction_id", nullable = false)
	private Auction auction;

	
	//Constructiors
	public Bid(Long id, Double amount, LocalDateTime bidTime, String bidderUsername, Auction auction) {
		super();
		this.id = id;
		this.amount = amount;
		this.bidTime = bidTime;
		this.bidderUsername = bidderUsername;
		this.auction = auction;
	}


	public Bid() {
		// TODO Auto-generated constructor stub
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
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


	public Auction getAuction() {
		return auction;
	}


	public void setAuction(Auction auction) {
		this.auction = auction;
	}
	
	
	

	
}
