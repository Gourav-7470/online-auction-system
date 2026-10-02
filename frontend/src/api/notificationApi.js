import api from './axios';

export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  async getMyNotifications() {
    const response = await api.get('/notification/my');
    return response.data;
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications() {
    const response = await api.get('/notification/unread');
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param {number|string} id
   */
  async markAsRead(id) {
    const response = await api.put(`/notification/read/${id}`);
    return response.data;
  },

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead() {
    const response = await api.put('/notification/read-all');
    return response.data;
  },
};

export default notificationApi;
