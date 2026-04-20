import { createContext, useState, useEffect } from 'react';
import keycloak, { keycloakInitialized, setKeycloakInitialized } from '../keycloak';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

async function syncUserWithBackend() {
    try {
        const res = await axiosInstance.post('/user/sync');
        return res.data ?? null;
    } catch (err) {
        console.error('User sync failed:', err);
    }
    return null;
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
        if (keycloakInitialized) {
            setInitialized(true);
            return;
        }
        setKeycloakInitialized();
        keycloak
            .init({
                onLoad: 'check-sso',
                checkLoginIframe: false,
            })
            .then(async (authenticated) => {
                if (authenticated) {
                    try {
                        await keycloak.updateToken(30);
                    } catch (e) {
                        console.error('Failed to refresh token:', e);
                    }

                    // sync writes the JWT name to DB; use its response if available,
                    // otherwise fall back to a separate /user/me fetch
                    const syncedUser = await syncUserWithBackend();
                    const dbUser = syncedUser ?? await fetchUserProfile();

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

    const loginWithGoogle = () => keycloak.login({
        redirectUri: window.location.origin + '/flights',
        idpHint: 'google'
    });

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

    const updateUser = (patch) => setUser(prev => prev ? { ...prev, ...patch } : prev);

    return (
        <AuthContext.Provider value={{ user, updateUser, login, loginWithGoogle, register, logout, getToken, initialized }}>
            {children}
        </AuthContext.Provider>
    );
};