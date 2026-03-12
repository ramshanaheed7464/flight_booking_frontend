import axiosInstance from './axiosInstance';

export const getBookings = () => axiosInstance.get('/bookings');
export const createBooking = (data) => axiosInstance.post('/bookings', data);
export const cancelBooking = (id) => axiosInstance.put(`/bookings/${id}/cancel`);