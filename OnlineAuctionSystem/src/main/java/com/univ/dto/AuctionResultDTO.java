package com.univ.dto;

public class AuctionResultDTO {

	private long auctionId;
	private String title;
	private String status;
	private String winnerUsername;
	private Double winningAmount;
	private String result;

	public AuctionResultDTO(long auctionId, String title, String status, String winnerUsername, Double winningAmount,
			String result) {

		super();

		this.auctionId = auctionId;
		this.title = title;
		this.status = status;
		this.winnerUsername = winnerUsername;
		this.winningAmount = winningAmount;
		this.result = result;
	}

	public long getAuctionId() {
		return auctionId;
	}

	public void setAuctionId(long auctionId) {
		this.auctionId = auctionId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}
}