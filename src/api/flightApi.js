import axiosInstance from './axiosInstance';

export const getFlights = () => axiosInstance.get('/flights');
export const addFlight = (data) => axiosInstance.post('/flights/add', data);