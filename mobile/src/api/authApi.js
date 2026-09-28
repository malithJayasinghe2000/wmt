import client from './client';

export const loginRequest = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data.data);

export const registerRequest = (payload) =>
  client.post('/auth/register', payload).then((r) => r.data.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data.data);

export const updateMe = (payload) => client.put('/auth/me', payload).then((r) => r.data.data);
