import axios from 'axios';
import keycloak from '../keycloak';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
    if (keycloak.isTokenExpired(30)) {
        await keycloak.updateToken(30);
    }
    if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
});

export default axiosInstance;