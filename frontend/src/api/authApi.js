import api from './axios';

export const authApi = {
  /**
   * Login user with username and password
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<string>} JWT Token
   */
  async login(credentials) {
    const response = await api.post('/login', {
      username: credentials.username.trim(),
      password: credentials.password,
    });

    const data = response.data;
    // Check for string responses from UserController
    if (typeof data === 'string') {
      if (data.includes('User not found')) {
        throw new Error('User not found. Please check your username or register.');
      }
      if (data.includes('Invalid Password')) {
        throw new Error('Invalid password. Please try again.');
      }
      return data.trim(); // The JWT token
    }

    // If returned as object with token
    if (data && data.token) {
      return data.token;
    }

    return String(data);
  },

  /**
   * Register new user
   * @param {{ name: string, username: string, email: string, password: string, role?: string }} userData
   * @returns {Promise<object>} Created user object
   */
  async register(userData) {
    const payload = {
      name: userData.name?.trim(),
      username: userData.username?.trim(),
      email: userData.email?.trim(),
      password: userData.password,
      role: userData.role || 'USER',
    };
    const response = await api.post('/register', payload);
    return response.data;
  },

  /**
   * Test JWT authentication
   * @returns {Promise<string>}
   */
  async testAuth() {
    const response = await api.get('/test');
    return response.data;
  },
};

export default authApi;
