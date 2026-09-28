import client from './client';

export const getSpecializations = () => client.get('/specializations').then((r) => r.data.data);

export const createSpecialization = (payload) =>
  client.post('/specializations', payload).then((r) => r.data.data);

export const updateSpecialization = (id, payload) =>
  client.put(`/specializations/${id}`, payload).then((r) => r.data.data);

export const deleteSpecialization = (id) =>
  client.delete(`/specializations/${id}`).then((r) => r.data);
