package com.univ.dto;

public class DashboardDTO {

    private String username;

    private int totalAuctions;
    private int activeAuctions;
    private int closedAuctions;

    private int totalBids;

    private int watchlistCount;
    private int unreadNotifications;

    private int wonAuctions;
    private Double totalWinningAmount;


    public DashboardDTO() {
    }


    public DashboardDTO(
            String username,
            int totalAuctions,
            int activeAuctions,
            int closedAuctions,
            int totalBids,
            int watchlistCount,
            int unreadNotifications,
            int wonAuctions,
            Double totalWinningAmount) {

        this.username = username;
        this.totalAuctions = totalAuctions;
        this.activeAuctions = activeAuctions;
        this.closedAuctions = closedAuctions;
        this.totalBids = totalBids;
        this.watchlistCount = watchlistCount;
        this.unreadNotifications = unreadNotifications;
        this.wonAuctions = wonAuctions;
        this.totalWinningAmount = totalWinningAmount;
    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    public int getTotalAuctions() {
        return totalAuctions;
    }

    public void setTotalAuctions(int totalAuctions) {
        this.totalAuctions = totalAuctions;
    }


    public int getActiveAuctions() {
        return activeAuctions;
    }

    public void setActiveAuctions(int activeAuctions) {
        this.activeAuctions = activeAuctions;
    }


    public int getClosedAuctions() {
        return closedAuctions;
    }

    public void setClosedAuctions(int closedAuctions) {
        this.closedAuctions = closedAuctions;
    }


    public int getTotalBids() {
        return totalBids;
    }

    public void setTotalBids(int totalBids) {
        this.totalBids = totalBids;
    }


    public int getWatchlistCount() {
        return watchlistCount;
    }

    public void setWatchlistCount(int watchlistCount) {
        this.watchlistCount = watchlistCount;
    }


    public int getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(int unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }


    public int getWonAuctions() {
        return wonAuctions;
    }

    public void setWonAuctions(int wonAuctions) {
        this.wonAuctions = wonAuctions;
    }


    public Double getTotalWinningAmount() {
        return totalWinningAmount;
    }

    public void setTotalWinningAmount(Double totalWinningAmount) {
        this.totalWinningAmount = totalWinningAmount;
    }
}