import { createContext, useState, useEffect } from 'react';
import keycloak from '../keycloak';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

async function syncUserWithBackend() {
    try {
        const res = await axiosInstance.post('/user/sync');
        if (res.status < 200 || res.status >= 300) {
            console.error('Sync failed with status:', res.status);
        }
    } catch (err) {
        console.error('User sync failed:', err);
    }
}

async function fetchUserProfile() {
    try {
        const res = await axiosInstance.get('/user/me');
        return res.data;
    } catch (err) {
        console.error('Failed to fetch user profile:', err);
    }
    return null;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (keycloak.didInitialize) {
            setInitialized(true);
            return;
        }
        keycloak
            .init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                checkLoginIframe: false,
            })
            .then(async (authenticated) => {
                if (authenticated) {
                    try {
                        await keycloak.updateToken(30);
                        console.log('Full token:', keycloak.token);
                        console.log('Token parsed:', keycloak.tokenParsed);
                    } catch (e) {
                        console.error('Failed to refresh token:', e);
                    }

                    console.log('Token available:', !!keycloak.token);
                    await syncUserWithBackend();

                    const dbUser = await fetchUserProfile();
                    console.log('dbUser:', dbUser);
                    console.log('dbUser role:', dbUser?.role);
                    console.log('current path:', window.location.pathname);
                    console.log('keycloak roles:', keycloak.tokenParsed?.realm_access?.roles);

                    if (dbUser) {
                        setUser(dbUser);
                        if (dbUser.role === 'ADMIN' && window.location.pathname === '/flights') {
                            window.location.replace('/admin');
                        }
                    } else {
                        const tokenParsed = keycloak.tokenParsed;
                        const roles = tokenParsed?.realm_access?.roles || [];
                        setUser({
                            name: tokenParsed?.name || tokenParsed?.preferred_username,
                            email: tokenParsed?.email,
                            role: (roles.includes('ADMIN') || roles.includes('admin')) ? 'ADMIN' : 'USER',
                        });
                    }
                }
                setInitialized(true);
            })
            .catch((err) => {
                console.error('Keycloak init failed:', err);
                setInitialized(true);
            });
    }, []);

    const login = () => keycloak.login({
        redirectUri: window.location.origin + '/flights'
    });

    const register = () => keycloak.register({
        redirectUri: window.location.origin + '/flights'
    });

    const logout = () => {
        setUser(null);
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const getToken = () => keycloak.token;

    if (!initialized) return null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getToken, initialized }}>
            {children}
        </AuthContext.Provider>
    );
};