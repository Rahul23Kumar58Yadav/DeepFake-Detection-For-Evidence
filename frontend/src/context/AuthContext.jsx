import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function - called from Login component
  const login = (userData, token) => {
    try {
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Login error in context:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function - called from Register component
  const register = (userData, token) => {
    try {
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Registration error in context:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function - called from Profile and Navbar
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user data - for profile updates
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get auth token - for API calls
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  // Get auth headers - helper for API calls
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    getToken,
    getAuthHeaders,

  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;