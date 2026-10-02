import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  decodeJwt,
  isTokenExpired,
} from '../utils/auth';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      if (isTokenExpired(existingToken)) {
        removeToken();
        removeUser();
        setTokenState(null);
        setUserState(null);
      } else {
        const decoded = decodeJwt(existingToken);
        const savedUser = getUser();
        if (decoded) {
          const updatedUser = {
            username: decoded.sub || savedUser?.username || 'User',
            role: (decoded.role || savedUser?.role || 'USER').toUpperCase(),
            name: savedUser?.name || decoded.sub || '',
            email: savedUser?.email || '',
          };
          setUserState(updatedUser);
          setUser(updatedUser);
        }
      }
    }
    setLoading(false);
  }, []);

  /**
   * Handle user login
   */
  const login = useCallback(async (credentials) => {
    const jwtToken = await authApi.login(credentials);
    const decoded = decodeJwt(jwtToken);

    const userObj = {
      username: decoded?.sub || credentials.username,
      role: (decoded?.role || 'USER').toUpperCase(),
      name: credentials.username,
      email: credentials.email || '',
    };

    setToken(jwtToken);
    setUser(userObj);
    setTokenState(jwtToken);
    setUserState(userObj);

    return { token: jwtToken, user: userObj };
  }, []);

  /**
   * Handle user registration
   */
  const register = useCallback(async (userData) => {
    const registeredUser = await authApi.register(userData);
    return registeredUser;
  }, []);

  /**
   * Handle user logout
   */
  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  }, []);

  const isAuthenticated = Boolean(token && user && !isTokenExpired(token));
  const role = user?.role || 'USER';
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';

  const value = {
    token,
    user,
    role,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
