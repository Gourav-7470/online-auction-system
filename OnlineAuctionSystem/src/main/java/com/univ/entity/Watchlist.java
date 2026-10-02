package com.univ.entity;

import org.hibernate.validator.constraints.UniqueElements;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist", uniqueConstraints =  {@UniqueConstraint(columnNames = {"username", "auction_id"})})
public class Watchlist {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String username;
	
	@ManyToOne
	@JoinColumn(name = "auction_id", nullable = false)
	private Auction auction;

	public Watchlist() {
		super();
	}

	public Watchlist(Long id, String username, Auction auction) {
		super();
		this.id = id;
		this.username = username;
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

	public Auction getAuction() {
		return auction;
	}

	public void setAuction(Auction auction) {
		this.auction = auction;
	}
	
	
	
	

}
