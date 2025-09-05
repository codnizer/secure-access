import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode'; // Optional: To decode the JWT token
import { useNavigate } from 'react-router';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate=useNavigate()
  // Save the user to localStorage when logged in
  const login = (token) => {
    localStorage.setItem('token', token);

    // Decode the token to get user information (e.g., userId, isAdmin)
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
   };

 
  

  // Clear the user and token on logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/')
  };

  // Automatically load the user from the token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

 
  

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
