import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, role: 'USER' | 'ARTIST' | 'ADMIN', avatar }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/current-user');
        if (res.data?.user) {
          const u = res.data.user;
          setUser({ id: u.id || u._id, name: u.username, role: u.role.toUpperCase(), email: u.email });
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data?.user) {
          const u = res.data.user;
          setUser({ id: u.id || u._id, name: u.username, role: u.role.toUpperCase(), email: u.email });
          if (res.data.token) localStorage.setItem('authToken', res.data.token);
      }
      return true;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const payload = { ...userData, role: userData.role?.toLowerCase() || 'user' };
      const res = await axios.post('/auth/register', payload);
      if (res.data?.user) {
          const u = res.data.user;
          setUser({ id: u.id || u._id, name: u.username, role: u.role.toUpperCase(), email: u.email });
          if (res.data.token) localStorage.setItem('authToken', res.data.token);
      }
      return true;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await axios.get('/auth/logout');
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
