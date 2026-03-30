import axiosInstance from './axiosInstance';

export const getProfile = () => axiosInstance.get('/user/me');
export const updateProfile = (data) => axiosInstance.put('/user/me', data);