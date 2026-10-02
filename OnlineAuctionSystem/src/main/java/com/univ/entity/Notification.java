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
@Table(name = "notification")
public class Notification {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String username;
	
	private String message;
	
	private boolean isRead;
	
	private LocalDateTime  createdAt;
	
	
	@ManyToOne
	@JoinColumn(name= "auction_id")
	private Auction auction;


	public Notification() {
		super();
		// TODO Auto-generated constructor stub
	}


	public Notification(Long id, String username, String message, boolean isRead, LocalDateTime createdAt,
			Auction auction) {
		super();
		this.id = id;
		this.username = username;
		this.message = message;
		this.isRead = isRead;
		this.createdAt = createdAt;
		this.auction = auction;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getUsername() {
		return username;
	}


	public void setUsername(String username) {
		this.username = username;
	}


	public String getMessage() {
		return message;
	}


	public void setMessage(String message) {
		this.message = message;
	}


	public boolean isRead() {
		return isRead;
	}


	public void setRead(boolean isRead) {
		this.isRead = isRead;
	}


	public LocalDateTime getCreatedAt() {
		return createdAt;
	}


	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}


	public Auction getAuction() {
		return auction;
	}


	public void setAuction(Auction auction) {
		this.auction = auction;
	}
	
	
}
