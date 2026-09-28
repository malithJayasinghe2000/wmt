import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const client = axios.create({ baseURL: API_URL, timeout: 20000 });

// Attach the JWT to every request automatically
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any API failure into a plain message the screens can show
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to answer. Try again.'
        : 'Cannot reach the server. Check your connection.');
    return Promise.reject(new Error(message));
  }
);

export default client;
