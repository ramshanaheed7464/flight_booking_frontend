import axiosInstance from './axiosInstance';

export const getNationalities = () => axiosInstance.get('/booking-options/nationalities');
export const addNationality = (name) => axiosInstance.post('/booking-options/nationalities', { name });
export const updateNationality = (id, name) => axiosInstance.put(`/booking-options/nationalities/${id}`, { name });
export const deleteNationality = (id) => axiosInstance.delete(`/booking-options/nationalities/${id}`);

export const getMealPreferences = () => axiosInstance.get('/booking-options/meals');
export const addMealPreference = (name) => axiosInstance.post('/booking-options/meals', { name });
export const updateMealPreference = (id, name) => axiosInstance.put(`/booking-options/meals/${id}`, { name });
export const deleteMealPreference = (id) => axiosInstance.delete(`/booking-options/meals/${id}`);