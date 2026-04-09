import keycloak from '../keycloak';

export const login = () => keycloak.login();

export const logout = () => keycloak.logout({ redirectUri: window.location.origin });

export const register = () => keycloak.register();