import axiosInstance from './axiosInstance';

export const getFlights = () => axiosInstance.get('/flights');
export const addFlight = (data) => axiosInstance.post('/flights/add', data);
export const updateFlight = (id, data) => axiosInstance.put(`/flights/${id}`, data);
export const deleteFlight = (id) => axiosInstance.delete(`/flights/${id}`);