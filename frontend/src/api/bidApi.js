import api from './axios';

export const bidApi = {
  /**
   * Place a bid on an auction
   * Backend endpoint: POST /bid/place/{auctionId}?amount={amount}
   * @param {number|string} auctionId
   * @param {number|string} amount
   */
  async placeBid(auctionId, amount) {
    const response = await api.post(`/bid/place/${auctionId}`, null, {
      params: {
        amount: Number(amount),
      },
    });
    return response.data;
  },

  /**
   * Get all bids (Requires ADMIN role in backend)
   */
  async getAllBids() {
    const response = await api.get('/bid/all');
    return response.data;
  },

  /**
   * Get all bids for a specific auction
   * @param {number|string} auctionId
   */
  async getBidsByAuction(auctionId) {
    const response = await api.get(`/bid/auction/${auctionId}`);
    return response.data;
  },

  /**
   * Get paginated bids for a specific auction
   * @param {number|string} auctionId
   * @param {number} page
   * @param {number} size
   */
  async getAuctionBidHistory(auctionId, page = 0, size = 10) {
    const response = await api.get(`/bid/auction/${auctionId}/page`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get paginated bids placed by current logged-in user
   * @param {number} page
   * @param {number} size
   */
  async getMyBids(page = 0, size = 10) {
    const response = await api.get('/bid/my', {
      params: { page, size },
    });
    return response.data;
  },
};

export default bidApi;
