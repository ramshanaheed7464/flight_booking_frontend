import axios from 'axios';
import axiosInstance from './axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const publicApi = axios.create({ baseURL: API_URL });

// ── Merged: world cities (CountriesNow) + admin-added DB cities ──
// This ensures cities like Sargodha that are missing from the public API
// are still available because the admin added them when creating a flight.
export const getAllCities = () =>
    Promise.all([
        // 1. World cities from CountriesNow (no API key required)
        axios.get('https://countriesnow.space/api/v0.1/countries').catch(() => null),
        // 2. Admin-added cities from your own DB
        publicApi.get('/locations/cities').catch(() => null),
    ]).then(([worldRes, dbRes]) => {
        const seen = new Set();
        const allCities = [];
        let idCounter = 0;

        const add = (name, country = '') => {
            const key = name.trim().toLowerCase();
            if (!key || seen.has(key)) return;
            seen.add(key);
            allCities.push({ id: idCounter++, name: name.trim(), country });
        };

        // Add world cities first
        if (Array.isArray(worldRes?.data?.data)) {
            worldRes.data.data.forEach(countryObj => {
                if (Array.isArray(countryObj.cities)) {
                    countryObj.cities.forEach(cityName => add(cityName, countryObj.country));
                }
            });
        }

        // Merge DB cities — fills gaps (e.g. Sargodha) not in the public API
        if (Array.isArray(dbRes?.data)) {
            dbRes.data.forEach(c => add(c.name, c.country ?? ''));
        }

        // Sort alphabetically
        allCities.sort((a, b) => a.name.localeCompare(b.name));

        return { data: allCities };
    });

// ── Admin only — manages cities linked to flights in your own DB ──
export const addCity = (data) => axiosInstance.post('/locations/cities', data);
export const updateCity = (id, data) => axiosInstance.put(`/locations/cities/${id}`, data);
export const deleteCity = (id) => axiosInstance.delete(`/locations/cities/${id}`);