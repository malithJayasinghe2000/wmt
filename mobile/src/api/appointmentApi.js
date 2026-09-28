import client from './client';

export const bookAppointment = (payload) =>
  client.post('/appointments', payload).then((r) => r.data.data);

export const getMyAppointments = (params = {}) =>
  client.get('/appointments/my', { params }).then((r) => r.data.data);

export const getAllAppointments = (params = {}) =>
  client.get('/appointments', { params }).then((r) => r.data.data);

export const getAppointment = (id) => client.get(`/appointments/${id}`).then((r) => r.data.data);

export const cancelAppointment = (id) =>
  client.put(`/appointments/${id}/cancel`).then((r) => r.data.data);

export const updateAppointmentStatus = (id, status) =>
  client.put(`/appointments/${id}/status`, { status }).then((r) => r.data.data);
