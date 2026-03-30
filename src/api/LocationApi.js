import axios from 'axios';
import axiosInstance from './axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const publicApi = axios.create({ baseURL: API_URL });

// Public — no auth needed
export const getAllCities = () => publicApi.get('/locations/cities');

// Admin only
export const addCity = (data) => axiosInstance.post('/locations/cities', data);
export const updateCity = (id, data) => axiosInstance.put(`/locations/cities/${id}`, data);
export const deleteCity = (id) => axiosInstance.delete(`/locations/cities/${id}`);