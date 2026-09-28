import client from './client';

export const createPrescription = (payload) =>
  client.post('/prescriptions', payload).then((r) => r.data.data);

export const getMyPrescriptions = () => client.get('/prescriptions/my').then((r) => r.data.data);

export const getPrescription = (id) => client.get(`/prescriptions/${id}`).then((r) => r.data.data);
