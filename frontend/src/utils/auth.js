// Utility functions for JWT handling and local storage

const TOKEN_KEY = 'bidzone_jwt_token';
const USER_KEY = 'bidzone_user_info';

/**
 * Safely decodes a JWT payload without external libraries
 * @param {string} token
 * @returns {object|null}
 */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode JWT token:', err);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Store JWT token in localStorage
 * @param {string} token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve JWT token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (isTokenExpired(token)) {
    removeToken();
    removeUser();
    return null;
  }
  return token;
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Store user object in localStorage
 * @param {object} user
 */
export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Retrieve user object from localStorage
 * @returns {object|null}
 */
export function getUser() {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Remove user object from localStorage
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}
