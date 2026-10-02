import api from './axios';

export const userApi = {
  /**
   * Get user dashboard route string
   */
  async getUserDashboardMessage() {
    const response = await api.get('/user/dashboard');
    return response.data;
  },

  /**
   * Get admin dashboard route string
   */
  async getAdminDashboardMessage() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

export default userApi;
