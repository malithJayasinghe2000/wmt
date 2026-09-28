import client from './client';

export const getNotifications = () => client.get('/notifications').then((r) => r.data);

export const markNotificationRead = (id) =>
  client.put(`/notifications/${id}/read`).then((r) => r.data.data);
