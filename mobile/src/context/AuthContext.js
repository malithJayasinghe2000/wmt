import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, restore the session from the saved token
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const me = await getMe();
          setUser(me);
        }
      } catch (error) {
        await AsyncStorage.removeItem('token'); // token expired or invalid
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    await AsyncStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    await AsyncStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await getMe();
    setUser((prev) => ({ ...prev, ...me }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
