import axiosInstance from './axiosInstance';

export const getBookings = () => axiosInstance.get('/bookings');
export const createBooking = (data) => axiosInstance.post('/bookings', data);
export const cancelBooking = (id) => axiosInstance.put(`/bookings/${id}/cancel`);

// Admin
export const getAllBookings = () => axiosInstance.get('/bookings/all');
export const updateBookingStatus = (id, status) => axiosInstance.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => axiosInstance.delete(`/bookings/${id}`);