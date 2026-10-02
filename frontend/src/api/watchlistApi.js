import api from './axios';

export const watchlistApi = {
  /**
   * Get all watchlist items for logged-in user
   */
  async getMyWatchlist() {
    const response = await api.get('/watchlist/my');
    return response.data;
  },

  /**
   * Add auction to watchlist
   * @param {number|string} auctionId
   */
  async addToWatchlist(auctionId) {
    const response = await api.post(`/watchlist/add/${auctionId}`);
    return response.data;
  },

  /**
   * Remove auction from watchlist
   * @param {number|string} auctionId
   */
  async removeFromWatchlist(auctionId) {
    const response = await api.delete(`/watchlist/remove/${auctionId}`);
    return response.data;
  },
};

export default watchlistApi;
