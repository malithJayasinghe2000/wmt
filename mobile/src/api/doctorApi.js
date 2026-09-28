import client from './client';

export const getDoctors = (params = {}) =>
  client.get('/doctors', { params }).then((r) => r.data.data);

export const getDoctor = (id) => client.get(`/doctors/${id}`).then((r) => r.data.data);

export const createDoctor = (payload) => client.post('/doctors', payload).then((r) => r.data.data);

export const updateDoctor = (id, payload) =>
  client.put(`/doctors/${id}`, payload).then((r) => r.data.data);

export const deleteDoctor = (id) => client.delete(`/doctors/${id}`).then((r) => r.data);
