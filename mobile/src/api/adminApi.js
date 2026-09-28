import client from './client';

export const getUsers = (params = {}) => client.get('/users', { params }).then((r) => r.data.data);

export const toggleBlockUser = (id) => client.put(`/users/${id}/block`).then((r) => r.data.data);

export const getStats = () => client.get('/dashboard/stats').then((r) => r.data.data);
