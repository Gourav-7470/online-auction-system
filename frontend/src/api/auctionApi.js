import api from './axios';

export const auctionApi = {
  /**
   * Fetch all auctions
   */
  async getAllAuctions() {
    const response = await api.get('/auction/all');
    return response.data;
  },

  /**
   * Fetch active auctions
   */
  async getActiveAuctions() {
    const response = await api.get('/auction/active');
    return response.data;
  },

  /**
   * Fetch closed auctions
   */
  async getClosedAuctions() {
    const response = await api.get('/auction/closed');
    return response.data;
  },

  /**
   * Fetch auctions created by logged-in user (requires ADMIN role in backend SecurityConfig)
   */
  async getMyAuctions() {
    const response = await api.get('/auction/my');
    return response.data;
  },

  /**
   * Fetch single auction response DTO by ID
   */
  async getAuctionById(id) {
    const response = await api.get(`/auction/${id}`);
    return response.data;
  },

  /**
   * Fetch auction winner info
   */
  async getAuctionWinner(id) {
    const response = await api.get(`/auction/${id}/winner`);
    return response.data;
  },

  /**
   * Fetch auction result DTO
   */
  async getAuctionResult(id) {
    const response = await api.get(`/auction/${id}/result`);
    return response.data;
  },

  /**
   * Paginated auctions
   */
  async getAuctionsPage(page = 0, size = 10) {
    const response = await api.get('/auction/page', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Search auctions with title, status, page, size, sorting
   */
  async searchAuctions({
    title = '',
    status = '',
    page = 0,
    size = 9,
    sortBy = 'id',
    direction = 'desc',
  } = {}) {
    const params = { page, size, sortBy, direction };
    if (title && title.trim()) params.title = title.trim();
    if (status && status !== 'ALL') params.status = status;

    const response = await api.get('/auction/search', { params });
    return response.data;
  },

  /**
   * Create new auction (Requires ADMIN role in backend)
   */
  async createAuction(auctionData) {
    // Format payload to strictly match backend Auction entity
    const payload = {
      title: auctionData.title?.trim(),
      description: auctionData.description?.trim(),
      startingPrice: Number(auctionData.startingPrice),
      currentPrice: Number(auctionData.startingPrice),
      startTime: auctionData.startTime, // Format: YYYY-MM-DDTHH:mm:ss
      endTime: auctionData.endTime,     // Format: YYYY-MM-DDTHH:mm:ss
      status: auctionData.status || 'ACTIVE',
    };

    const response = await api.post('/auction/create', payload);
    return response.data;
  },

  /**
   * Update an existing auction (Requires ADMIN role in backend)
   */
  async updateAuction(id, auctionData) {
    const response = await api.put(`/auction/${id}`, auctionData);
    return response.data;
  },

  /**
   * Close an auction manually (Requires ADMIN role in backend)
   */
  async closeAuction(id) {
    const response = await api.put(`/auction/close/${id}`);
    return response.data;
  },

  /**
   * Relist a closed auction (Requires ADMIN role in backend)
   */
  async relistAuction(id, startTime, endTime) {
    const response = await api.put(`/auction/relist/${id}`, null, {
      params: { startTime, endTime },
    });
    return response.data;
  },

  /**
   * Delete an auction (Requires ADMIN role in backend)
   */
  async deleteAuction(id) {
    const response = await api.delete(`/auction/${id}`);
    return response.data;
  },
};

export default auctionApi;
