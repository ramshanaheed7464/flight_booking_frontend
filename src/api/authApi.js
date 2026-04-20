import keycloak from '../keycloak';
import axiosInstance from './axiosInstance';

export const login = () => keycloak.login();

export const logout = () => keycloak.logout({ redirectUri: window.location.origin });

export const register = () => keycloak.register();

export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);
export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);
export const verifyEmail = (data) => axiosInstance.post('/auth/verify-email', data);
export const resendCode = (data) => axiosInstance.post('/auth/resend-code', data);