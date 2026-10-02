import api from './axios';

export const dashboardApi = {
  /**
   * Get user dashboard metrics
   * Returns DashboardDTO:
   * {
   *   username, totalAuctions, activeAuctions, closedAuctions,
   *   totalBids, watchlistCount, unreadNotifications,
   *   wonAuctions, totalWinningAmount
   * }
   */
  async getMyDashboard() {
    const response = await api.get('/dashboard/my');
    return response.data;
  },
};

export default dashboardApi;
