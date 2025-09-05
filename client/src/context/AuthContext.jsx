import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Our Axios instance
// import { jwtDecode } from 'jwt-decode'; // Uncomment if you install jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Could store decoded token info
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('admin_token'); // Or check for other token types
      if (token) {
        try {
          // You might want to verify the token with your backend or decode it
          // For simplicity here, we'll just set a dummy user if a token exists
          // In a real app, you'd probably call an /api/auth/me endpoint to get user details
          // const decoded = jwtDecode(token);
          // setUser({ id: decoded.userId, email: decoded.email, role: decoded.role });
          setUser({ email: 'admin@example.com', role: 'admin' }); // Dummy user
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    };

    loadUserFromToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Replace with your actual admin login endpoint
      const response = await api.post('/auth/admin/login', { email, password });
      const { token, user: userData } = response.data; // Assuming your backend returns token and user data
      localStorage.setItem('admin_token', token);
      setUser(userData || { email, role: 'admin' }); // Set user data from response or dummy
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/admin/dashboard');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      localStorage.removeItem('admin_token');
      throw error; // Re-throw to be handled by the component
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = () => {
    return !!user; // Simple check if a user object exists
  };

  // You might add specific role checks here, e.g., isAdmin, isGuard, isPersonnel
  const isAdmin = () => user?.role === 'admin';

  const authContextValue = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};