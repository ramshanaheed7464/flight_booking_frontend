import axiosInstance from './axiosInstance';

export const getProfile = () => axiosInstance.get('/user/me');
export const updateProfile = (data) => axiosInstance.put('/user/me', data);
export const changePassword = (data) => axiosInstance.put('/user/me/password', data);