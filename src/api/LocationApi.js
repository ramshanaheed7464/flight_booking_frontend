import axiosInstance from './axiosInstance';

export const getCountries = () =>
    axiosInstance.get('/locations/countries');

export const addCountry = (data) =>
    axiosInstance.post('/locations/countries', data);

export const updateCountry = (id, data) =>
    axiosInstance.put(`/locations/countries/${id}`, data);

export const deleteCountry = (id) =>
    axiosInstance.delete(`/locations/countries/${id}`);

export const getCitiesByCountryId = (countryId) =>
    axiosInstance.get('/locations/cities', { params: { countryId } });

export const getCitiesByCountryCode = (countryCode) =>
    axiosInstance.get('/locations/cities', { params: { countryCode } });

export const getAllCities = () =>
    axiosInstance.get('/locations/cities');

export const addCity = (data) =>
    axiosInstance.post('/locations/cities', data);          // { name, countryId }

export const updateCity = (id, data) =>
    axiosInstance.put(`/locations/cities/${id}`, data);     // { name }

export const deleteCity = (id) =>
    axiosInstance.delete(`/locations/cities/${id}`);