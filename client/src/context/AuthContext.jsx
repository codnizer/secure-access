import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Our Axios instance
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          // Verify token is still valid by making a request to the backend
          const response = await api.get('/api/admins/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.valid) {
            const decoded = jwtDecode(token);
            setUser({ 
              id: decoded.id, 
              email: decoded.email, 
              role: decoded.role,
              fname: decoded.fname,
              lname: decoded.lname
            });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            throw new Error('Token invalid');
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem('admin_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUserFromToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/admins/auth/login', { email, password });
      const { token, admin } = response.data; // Your backend returns { token, admin }
      
      localStorage.setItem('admin_token', token);
      
      // Set user data from the response
      setUser({
        id: admin.id,
        email: admin.email,
        fname: admin.fname,
        lname: admin.lname,
        phone: admin.phone,
        role: 'admin'
      });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/admin/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      localStorage.removeItem('admin_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Return error information for handling in components
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/admin/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

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