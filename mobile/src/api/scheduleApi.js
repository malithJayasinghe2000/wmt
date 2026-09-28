import client from './client';

export const getSchedules = (params = {}) =>
  client.get('/schedules', { params }).then((r) => r.data.data);

export const createSchedule = (payload) =>
  client.post('/schedules', payload).then((r) => r.data.data);

export const updateSchedule = (id, payload) =>
  client.put(`/schedules/${id}`, payload).then((r) => r.data.data);

export const deleteSchedule = (id) => client.delete(`/schedules/${id}`).then((r) => r.data);
